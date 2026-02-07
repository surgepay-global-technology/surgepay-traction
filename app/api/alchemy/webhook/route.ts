import { NextRequest, NextResponse } from 'next/server';
import { verifyAlchemySignature, AlchemyWebhookEvent, AlchemyWebhookType } from '@/lib/alchemy-webhook';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-alchemy-signature');

    // Verify webhook signature
    const isValid = verifyAlchemySignature(rawBody, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const event: AlchemyWebhookEvent = JSON.parse(rawBody);

    console.log('Received Alchemy webhook event:', {
      id: event.id,
      webhookId: event.webhookId,
      type: event.type,
      createdAt: event.createdAt,
      network: event.event.network,
      activityCount: event.event.activity?.length || 0,
    });

    // Store webhook event in database for auditing
    try {
      await supabase.from('webhook_events').insert({
        provider: 'alchemy',
        event_id: event.id,
        webhook_id: event.webhookId,
        event_type: event.type,
        payload: event.event,
        created_at: event.createdAt,
      });
    } catch (dbError) {
      console.error('Failed to store webhook event:', dbError);
      // Continue processing even if storage fails
    }

    // Handle different event types
    switch (event.type) {
      case AlchemyWebhookType.ADDRESS_ACTIVITY:
        await handleAddressActivity(event);
        break;

      case AlchemyWebhookType.MINED_TRANSACTION:
        await handleMinedTransaction(event);
        break;

      case AlchemyWebhookType.DROPPED_TRANSACTION:
        await handleDroppedTransaction(event);
        break;

      case AlchemyWebhookType.NFT_ACTIVITY:
        await handleNFTActivity(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleAddressActivity(event: AlchemyWebhookEvent) {
  const { network, activity } = event.event;
  
  console.log('Processing address activity:', {
    network,
    activityCount: activity.length,
  });

  // Process each activity
  for (const act of activity) {
    console.log('Activity:', {
      from: act.fromAddress,
      to: act.toAddress,
      hash: act.hash,
      value: act.value,
      asset: act.asset,
      category: act.category,
    });

    // Add your business logic here
    // For example: Update wallet balances, send notifications, track transactions
    try {
      await supabase.from('blockchain_activities').insert({
        network,
        transaction_hash: act.hash,
        from_address: act.fromAddress,
        to_address: act.toAddress,
        value: act.value,
        asset: act.asset,
        category: act.category,
        block_number: act.blockNum,
        contract_address: act.rawContract?.address,
        raw_value: act.rawContract?.rawValue,
        decimals: act.rawContract?.decimals,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to store activity:', error);
    }
  }
}

async function handleMinedTransaction(event: AlchemyWebhookEvent) {
  console.log('Processing mined transaction:', event);
  
  // Add your business logic here
  // For example: Confirm pending transactions, update order status
}

async function handleDroppedTransaction(event: AlchemyWebhookEvent) {
  console.log('Processing dropped transaction:', event);
  
  // Add your business logic here
  // For example: Handle failed transactions, retry logic
}

async function handleNFTActivity(event: AlchemyWebhookEvent) {
  console.log('Processing NFT activity:', event);
  
  // Add your business logic here
  // For example: Track NFT transfers, update ownership
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/alchemy/webhook',
    provider: 'alchemy',
    timestamp: new Date().toISOString(),
  });
}
