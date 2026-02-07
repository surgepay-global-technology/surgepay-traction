import { NextRequest, NextResponse } from 'next/server';
import { verifyCoinbaseWebhookSignature } from '@/lib/coinbase';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');

    // Verify webhook signature
    const isValid = verifyCoinbaseWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('Invalid Coinbase webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(rawBody);

    console.log('Received Coinbase webhook event:', {
      id: event.id,
      type: event.type,
      created_at: event.created_at,
    });

    // Store webhook event in database for auditing
    try {
      await supabase.from('webhook_events').insert({
        provider: 'coinbase',
        event_id: event.id,
        event_type: event.type,
        payload: event.data,
        created_at: event.created_at || new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to store webhook event:', dbError);
    }

    // Handle different event types
    handleCoinbaseEvent(event);

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('Error processing Coinbase webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleCoinbaseEvent(event: any) {
  console.log('Processing Coinbase event:', {
    type: event.type,
    data: event.data,
  });

  // Add your business logic here based on event type
  // Examples: wallet transfers, payment confirmations, etc.
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/coinbase/webhook',
    provider: 'coinbase',
    timestamp: new Date().toISOString(),
  });
}
