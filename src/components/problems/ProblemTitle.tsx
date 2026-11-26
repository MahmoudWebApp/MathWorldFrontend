'use client';
import {parseMathSegments} from '@/lib/mathSegments';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {cn} from '@/lib/utils';
/** Inline bilingual math title; inherits its surrounding heading/row style. */
export function ProblemTitle({text,className}:{text:string;className?:string}){
 return <span dir="auto" className={cn('whitespace-pre-wrap break-words [unicode-bidi:plaintext]',className)}>{parseMathSegments(text).map((part,i)=>part.type==='text'?<span key={i}>{part.value}</span>:<LatexPreview key={i} latex={part.value}/>)}</span>;
}
