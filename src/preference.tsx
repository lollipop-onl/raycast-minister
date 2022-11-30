import { Form } from '@raycast/api';
import { useCachedState } from '@raycast/utils';

export default function Command() {
  const [webhookEndpoint, setWebhookEndpoint] = useCachedState(
    'minister-webhook-endpoint',
    ''
  );

  return (
    <Form>
      <Form.TextField
        id="webhookEndpoint"
        title='Slack Webhook Endpoint'
        placeholder='Enter webhook endpoint'
        defaultValue={webhookEndpoint}
        onChange={(value) => setWebhookEndpoint(value)}
      />
    </Form>
  )
}