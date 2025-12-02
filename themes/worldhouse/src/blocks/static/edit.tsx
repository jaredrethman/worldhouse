import { useBlockProps } from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";

interface Attributes {
  title: string;
}

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<Attributes>) {
  const { title } = attributes;
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <p>{title}</p>
      <button onClick={() => setAttributes({ title: "Changed Title 🕺" })}>+1</button>
    </div>
  );
}
