import { Card, SafePreview } from './UI.jsx';

// Only predefined visual examples are interpreted. Unknown input is text, never HTML.
export function Illustration({ value }) {
  if (value === undefined || value === null) return <p>Complete the operation to compare results.</p>;
  const examples = {
    '<b>Notebook</b>': <b>Notebook</b>,
    '<b>Welcome!</b>': <b>Welcome!</b>,
    '<b>Excellent notebook!</b>': <b>Excellent notebook!</b>,
    '<p style="color:red"><strong>Excellent notebook!</strong></p>': <p className="illustration-red"><strong>Excellent notebook!</strong></p>,
    '<p title="Sample review">Very useful for class.</p>': <p>Very useful for class.</p>,
    '<ul><li>Good paper</li><li>Easy to carry</li></ul>': <ul><li>Good paper</li><li>Easy to carry</li></ul>,
    '<p style="color:red">A shared comment</p>': <p className="illustration-red">A shared comment</p>,
    '<p title="untrusted">Search result</p>': <p>Search result</p>,
    '<strong style="color:red">Browser content</strong>': <strong className="illustration-red">Browser content</strong>,
    '<b>Hello</b>': <b>Hello</b>,
  };
  const known = Object.hasOwn(examples,value);
  return <><div className="demo-visitor" data-testid="unsafe-illustration">{known ? examples[value] : value || '(empty)'}</div><p className="field-help">{known?'Fixed React illustration matched to this exact sample; no untrusted HTML is rendered.': 'Custom input is displayed as text only. Select a provided formatting sample to see the conceptual visual difference.'}</p></>;
}
export function ProtectionComparison({value}){
  return <div className="grid two"><Card title="Safe plain text"><div className="demo-visitor" data-testid="comparison-text">{value || '(empty)'}</div><p>HTML characters stay visible because React treats the input as text.</p></Card><Card title="Safe rich text"><SafePreview html={value}/><p>DOMPurify preserves allowed formatting and removes disallowed attributes and elements.</p></Card></div>;
}
