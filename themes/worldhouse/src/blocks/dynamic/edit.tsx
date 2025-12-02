// Edit component
import { useBlockProps } from '@wordpress/block-editor';
export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: { title: string };
  setAttributes: (attributes: { title: string }) => void;
}) {
  const { title } = attributes;
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <p>{title}</p>
      <button onClick={() => setAttributes({ title: "Changed Title 🕺" })}>+1</button>
    </div>
  );
}
