import { Card, SafePreview } from './UI.jsx';

// Only predefined visual examples are interpreted. Unknown input is text, never HTML.
export function Illustration({ value }) {
  if (value === undefined || value === null) return <p>Complete the operation to compare results.</p>;
  const examples = {
    '<b>Notebook</b>': <b>Notebook</b>,
    '<b>Welcome!</b>': <b>Welcome!</b>,
    '<b>Excellent notebook!</b>': <b>Excellent notebook!</b>,
    '<p style="color:red"><strong>Excellent notebook!</strong></p>': <p className="illustration-red"><strong>Excellent notebook!</strong></p>,
    '<p title="Sample review">Very useful for class.</p>': <p title="Sample review">Very useful for class.</p>,
    '<ul><li>Good paper</li><li>Easy to carry</li></ul>': <ul><li>Good paper</li><li>Easy to carry</li></ul>,
    '<p style="color:red">A shared comment</p>': <p className="illustration-red">A shared comment</p>,
    '<p title="untrusted">Search result</p>': <p title="untrusted">Search result</p>,
    '<strong style="color:red">Browser content</strong>': <strong className="illustration-red">Browser content</strong>,
    '<b>Hello</b>': <b>Hello</b>,
  };
  const known = Object.hasOwn(examples,value);
  return <><div className="demo-visitor" data-testid="unsafe-illustration">{known ? examples[value] : value || '(empty)'}</div>{value === '<p title="Sample review">Very useful for class.</p>' && <p className="demo-outcome-note">Tooltip present: “Sample review” (hover the paragraph). The visible words are unchanged.</p>}<p className="field-help">{known?'Simulated appearance for this exact sample. No untrusted HTML is executed.': 'No formatting simulation for this input: it is shown as text. Choose a supplied sample to compare formatting.'}</p></>;
}
export function ProtectionComparison({value}){
  return <div className="grid two"><Card title="Safe plain text"><div className="demo-visitor" data-testid="comparison-text">{value || '(empty)'}</div><Outcome value={value} mode="text"/></Card><Card title="Safe rich text"><SafePreview html={value}/><Outcome value={value} mode="rich"/></Card></div>;
}

// Explain the teaching outcome without treating benign markup as an attack.
export function Outcome({value, mode, analysis, ready=true}){
  if(!ready) return <div className="demo-verdict"><h3>Comparison ready to run</h3><p>Complete the operation to see the actual protected result and its explanation.</p></div>;
  const styled=value === '<p style="color:red"><strong>Excellent notebook!</strong></p>' || value === '<p style="color:red">A shared comment</p>' || value === '<strong style="color:red">Browser content</strong>';
  const titled=value === '<p title="Sample review">Very useful for class.</p>' || value === '<p title="untrusted">Search result</p>';
  const formatted=['<b>Notebook</b>','<b>Welcome!</b>','<b>Excellent notebook!</b>','<b>Hello</b>','<ul><li>Good paper</li><li>Easy to carry</li></ul>'].includes(value);
  const plain=!/[<>]/.test(value||'');
  let heading, explanation;
  if(mode==='text'){
    heading=plain?'Correct: ordinary text is preserved':formatted||styled||titled?'Correct: formatting is not interpreted':'Correct: input remains literal text';
    explanation=plain?'There is no HTML formatting to prevent. Matching text is the expected result.':'This field is intended for plain text. Visible angle brackets are correct: the browser treats them as characters, not formatting instructions.';
  }else if(mode==='rich'){
    heading=styled?'Correct: red styling removed; text preserved':titled?'Correct: tooltip removed; visible words unchanged':formatted?'Correct: permitted formatting preserved':plain?'Correct: ordinary text preserved':'Correct: only allowed formatting may remain';
    explanation=styled?'The simulated red text and the actual protected text should differ in color. The strict policy removes style attributes.':titled?'The title attribute affects a tooltip, not the visible words. Our strict policy removes it; this harmless attribute is not an XSS attack.':formatted?'The formatting is permitted by the allowlist, so identical appearance is intentional.':plain?'Ordinary text requires no markup removal. Identical output is intentional.':'Inspect the sanitized preview rather than assuming every change indicates an attack.';
  }else{
    heading='Choose protection according to the feature';
    explanation='Plain text prevents formatting from being interpreted. Rich text permits selected formatting after sanitization. Neither requires a visible change for ordinary input.';
  }
  return <div className="demo-verdict" data-testid="learning-outcome"><h3>{heading}</h3><p>{explanation}</p>{analysis&&<p><strong>Actual server result:</strong> {analysis.removed_elements} element(s), {analysis.removed_attributes} attribute(s) removed. {analysis.status==='unchanged'?'No policy changes needed.':'Policy change or normalization is not proof of an attack.'}</p>}</div>;
}
