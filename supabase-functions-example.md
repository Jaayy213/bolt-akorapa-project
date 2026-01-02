# Supabase Edge Functions Example

## Paystack Webhook Handler

To complete the payment integration, you'll need to set up a Supabase Edge Function to handle Paystack webhooks. This ensures payment verification is secure and server-side.

### Function: paystack-webhook

Create this file at `supabase/functions/paystack-webhook/index.ts`:

```typescript
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const hash = await crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(paystackSecretKey + body)
    );
    const computedSignature = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSignature !== signature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("paystack_reference", reference)
        .maybeSingle();

      if (txError || !transaction) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await supabase
        .from("transactions")
        .update({ status: "success" })
        .eq("paystack_reference", reference);

      if (transaction.user_id) {
        const expiresAt = new Date();
        switch (transaction.subscription_type) {
          case "daily":
            expiresAt.setDate(expiresAt.getDate() + 1);
            break;
          case "weekly":
            expiresAt.setDate(expiresAt.getDate() + 7);
            break;
          case "monthly":
            expiresAt.setDate(expiresAt.getDate() + 30);
            break;
        }

        await supabase
          .from("users")
          .update({
            subscription_tier: transaction.subscription_type,
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.user_id);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy paystack-webhook
```

### Environment Variables

Set the Paystack secret key in Supabase:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_your_secret_key
```

### Webhook Configuration

In your Paystack dashboard:

1. Go to Settings > API Keys & Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/paystack-webhook`
3. Select events: `charge.success`
4. Save the webhook

### Testing Webhooks Locally

```bash
supabase functions serve paystack-webhook
```

Then use Paystack's webhook testing tool or a tool like ngrok to forward webhooks to your local development server.

## Additional Edge Functions

You may want to create these additional edge functions:

### 1. scheduled-notifications

Send subscription expiry reminders:

```typescript
// Runs daily via Supabase cron job
// Checks for subscriptions expiring in 24 hours
// Sends email/SMS notifications to users
```

### 2. auto-resolve-results

Integrate with sports API to automatically resolve prediction results:

```typescript
// Fetches match results from sports API
// Updates prediction status automatically
// Triggers ledger updates
```

### 3. analytics-aggregator

Generate daily/weekly/monthly analytics:

```typescript
// Aggregates performance metrics
// Calculates ROI, win streaks, best leagues
// Stores in analytics table for quick access
```

## Security Best Practices

1. Always validate webhook signatures
2. Use SUPABASE_SERVICE_ROLE_KEY only in edge functions (never in frontend)
3. Implement rate limiting for public endpoints
4. Log all payment transactions for audit trail
5. Use environment variables for all secrets
6. Enable CORS only for necessary origins in production

## Monitoring

Consider setting up:
- Supabase function logs monitoring
- Paystack webhook delivery monitoring
- Error tracking with Sentry or similar
- Uptime monitoring with UptimeRobot or similar
