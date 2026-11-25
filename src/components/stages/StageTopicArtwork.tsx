'use client';
import {useId} from 'react';
import Image from 'next/image';
import {cn} from '@/lib/utils';

/** Recolor the SVG's original shaded artwork without replacing white mathematical glyphs. */
export function StageTopicArtwork({src,accent,size=40,className}:{src:string;accent:string;size?:number;className?:string}){
 const id='mw-topic-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const rgb=/^#[0-9a-f]{6}$/i.test(accent)?[1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255):[.36,.14,1];
 const ramp=(v:number)=>[0,v*.45,v*.85,v+(1-v)*.25,v+(1-v)*.65,1].map(n=>n.toFixed(3)).join(' ');
 return <>
 <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none"><defs><filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues={ramp(rgb[0])}/><feFuncG type="table" tableValues={ramp(rgb[1])}/><feFuncB type="table" tableValues={ramp(rgb[2])}/></feComponentTransfer></filter></defs></svg>
 <Image src={src} alt="" width={size} height={size} unoptimized className={cn('mw-topic-icon-art',className)} style={{filter:'url(#'+id+')',width:size,height:size}}/>
 </>;
}
