import {build} from 'esbuild';
await build({entryPoints:['browser-admin.js'],bundle:true,format:'esm',outfile:'public/js/admin-bundle.js',minify:true,target:'es2022'});
console.log('Admin bundle built. Start the Node server with npm start.');
