import { supabase } from './supabase';

interface PaystackConfig {
  email: string;
  amount: number;
  currency: string;
  subscriptionType: 'daily' | 'weekly' | 'monthly';
  userId: string;
}

const planPrices = {
  daily: 500,
  weekly: 2000,
  monthly: 5000,
};

export async function initializePayment(config: PaystackConfig) {
  const reference = `akorapa_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const { error } = await supabase.from('transactions').insert({
    user_id: config.userId,
    paystack_reference: reference,
    amount: config.amount / 100,
    currency: config.currency,
    subscription_type: config.subscriptionType,
    status: 'pending',
  });

  if (error) {
    throw new Error('Failed to create transaction record');
  }

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!paystackPublicKey) {
    console.warn('Paystack public key not configured');
    return null;
  }

  if (typeof window !== 'undefined' && (window as any).PaystackPop) {
    const handler = (window as any).PaystackPop.setup({
      key: paystackPublicKey,
      email: config.email,
      amount: config.amount,
      currency: config.currency,
      ref: reference,
      callback: async (response: any) => {
        await verifyPayment(response.reference);
      },
      onClose: () => {
        console.log('Payment window closed');
      },
    });

    handler.openIframe();
  }

  return reference;
}

export async function verifyPayment(reference: string) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (error || !transaction) {
    throw new Error('Transaction not found');
  }

  const { error: updateError } = await supabase
    .from('transactions')
    .update({ status: 'success' })
    .eq('paystack_reference', reference);

  if (updateError) {
    throw new Error('Failed to update transaction');
  }

  if (transaction.user_id) {
    const expiresAt = new Date();
    switch (transaction.subscription_type) {
      case 'daily':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case 'weekly':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case 'monthly':
        expiresAt.setDate(expiresAt.getDate() + 30);
        break;
    }

    await supabase
      .from('users')
      .update({
        subscription_tier: transaction.subscription_type,
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.user_id);
  }

  return transaction;
}

export function getPlanPrice(plan: 'daily' | 'weekly' | 'monthly'): number {
  return planPrices[plan];
}
