// ============================================================
// Content Registry — Typography & heading content nodes
// ============================================================
import type { ContentDefinition } from '../store/types';

export const contentRegistry: ContentDefinition[] = [
  {
    contentType: 'heading',
    displayName: 'Heading',
    icon: 'font-size',
    defaultProps: {
      text: 'Section Heading',
      level: 'h2',
      variant: 'default',
      align: 'left',
      colorClass: 'lmn-heading-primary',
    },
    propSchema: [
      { name: 'text', label: 'Text', type: 'text', defaultValue: 'Section Heading' },
      { name: 'level', label: 'Level', type: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], defaultValue: 'h2' },
      { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'spacious'], defaultValue: 'default' },
      { name: 'align', label: 'Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'left' },
      { name: 'colorClass', label: 'Color', type: 'select', options: ['lmn-heading-primary', 'lmn-heading-secondary', 'lmn-text-strong', 'lmn-text-weak'], defaultValue: 'lmn-heading-primary' },
    ],
  },
  {
    contentType: 'display-heading',
    displayName: 'Display Heading',
    icon: 'font-size',
    defaultProps: {
      text: 'Hero Title',
      size: '1',
      align: 'center',
    },
    propSchema: [
      { name: 'text', label: 'Text', type: 'text', defaultValue: 'Hero Title' },
      { name: 'size', label: 'Size', type: 'select', options: ['1', '2', '3'], defaultValue: '1' },
      { name: 'align', label: 'Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'center' },
    ],
  },
  {
    contentType: 'paragraph',
    displayName: 'Paragraph',
    icon: 'align-left',
    defaultProps: {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      align: 'left',
      colorClass: 'lmn-text-strong',
      fontWeight: 'regular',
    },
    propSchema: [
      { name: 'text', label: 'Text', type: 'text', defaultValue: 'Lorem ipsum dolor sit amet...' },
      { name: 'align', label: 'Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'left' },
      { name: 'colorClass', label: 'Color', type: 'select', options: ['lmn-text-strong', 'lmn-text-weak', 'lmn-text-disabled'], defaultValue: 'lmn-text-strong' },
      { name: 'fontWeight', label: 'Weight', type: 'select', options: ['regular', 'bold', 'light'], defaultValue: 'regular' },
    ],
  },
  {
    contentType: 'lead',
    displayName: 'Lead Text',
    icon: 'align-left',
    defaultProps: {
      text: 'This is a lead paragraph that stands out from regular text.',
      align: 'left',
    },
    propSchema: [
      { name: 'text', label: 'Text', type: 'text', defaultValue: 'This is a lead paragraph that stands out from regular text.' },
      { name: 'align', label: 'Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'left' },
    ],
  },
];

/** Look up a content definition by its content type. */
export const getContentDefinition = (contentType: string): ContentDefinition | undefined =>
  contentRegistry.find((c) => c.contentType === contentType);
