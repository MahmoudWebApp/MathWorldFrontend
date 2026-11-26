import ts from 'typescript';
import path from 'node:path';
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
if(config.error)throw Error('Cannot read tsconfig');
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram(parsed.fileNames,parsed.options);
const checker=program.getTypeChecker();
const blocked=new Set(['alert','confirm','prompt']);
const globals=new Set(['window','globalThis','self']);
let count=0;const errors=[];
for(const source of program.getSourceFiles()){
  if(source.isDeclarationFile||!path.resolve(source.fileName).startsWith(path.resolve('src')+path.sep))continue;
  count++;
  function visit(node){
    if(ts.isCallExpression(node)){
      const expr=node.expression;
      let name;
      if(ts.isPropertyAccessExpression(expr)&&ts.isIdentifier(expr.expression)&&globals.has(expr.expression.text)&&blocked.has(expr.name.text))name=expr.name.text;
      else if(ts.isElementAccessExpression(expr)&&ts.isIdentifier(expr.expression)&&globals.has(expr.expression.text)&&ts.isStringLiteral(expr.argumentExpression)&&blocked.has(expr.argumentExpression.text))name=expr.argumentExpression.text;
      else if(ts.isIdentifier(expr)&&blocked.has(expr.text)){
        const symbol=checker.getSymbolAtLocation(expr);
        if(symbol?.declarations?.some(decl=>/lib\.dom\.d\.ts$/.test(decl.getSourceFile().fileName)))name=expr.text;
      }
      if(name){
        const pos=source.getLineAndCharacterOfPosition(node.getStart(source));
        errors.push(path.relative(process.cwd(),source.fileName)+':'+(pos.line+1)+' native '+name+'()');
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('PASS: '+count+' source files, no native browser confirmation or prompt calls.');
