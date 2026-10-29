export default {
 stories:['../stories/**/*.stories.jsx'],
 addons:['@storybook/addon-essentials','@storybook/addon-a11y'],
 framework:{name:'@storybook/react-vite',options:{}},
 core:{disableTelemetry:true},
 staticDirs:['../public'],
 docs:{autodocs:'tag'},
 async viteFinal(config){
   // Keep the multi-page production app out of the component preview build.
   return {...config,base:'./',build:{...config.build,rollupOptions:{}},server:{...config.server,host:'127.0.0.1'}};
 }
};
