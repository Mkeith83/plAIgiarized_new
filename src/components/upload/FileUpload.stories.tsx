import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/Upload/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    onUploadComplete: (text: string) => console.log('Upload complete:', text),
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/*', 'text/plain'],
  },
};

export const ImageOnly: Story = {
  args: {
    ...Default.args,
    allowedTypes: ['image/*'],
  },
}; 