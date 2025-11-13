import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    recipientId: z.string().min(1, 'Recipient ID is required'),
    message: z
      .string()
      .min(1, 'Message cannot be empty')
      .max(5000, 'Message is too long'),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
