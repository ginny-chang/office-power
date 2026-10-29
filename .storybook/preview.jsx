import React from 'react';
import '../src-shared/ui/components.css';
import '../src-shared/ui/workspace.css';
import '../stories/storybook.css';
export default {
 parameters: {
  layout:'padded',
  controls:{expanded:true},
  options:{storySort:{order:['Start here','Foundations','Components','Patterns','Product']}},
  backgrounds:{default:'Office canvas',values:[{name:'Office canvas',value:'#eef3f9'},{name:'Surface',value:'#fcfdff'}]},
  viewport:{viewports:{
   phone:{name:'Phone · 375px',styles:{width:'375px',height:'812px'}},
   tablet:{name:'Tablet · 768px',styles:{width:'768px',height:'1024px'}},
   desktop:{name:'Desktop · 1440px',styles:{width:'1440px',height:'900px'}}
  }}
 },
 decorators:[Story=><div className="op-story"><Story/></div>]
};
