!function(){var a=Handlebars.template,s=Handlebars.templates=Handlebars.templates||{};s.admin_list=a({1:function(a){var s=this.lambda,n=this.escapeExpression;return'    <li class="list-group-item">\n      <h4 class="list-group-item-heading">'+n(s(null!=a?a.name:a,a))+'</h4>\n      <p class="list-group-item-text">\n        <a href="/card/'+n(s(null!=a?a._id:a,a))+'"><span>ID: </span>'+n(s(null!=a?a._id:a,a))+"</a>\n      </p>\n    </li>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(a,s,n,l){var i,t='<div class="list">\n  <ul class="list-group">\n';return i=s.each.call(a,a,{name:"each",hash:{},fn:this.program(1,l),inverse:this.noop,data:l}),null!=i&&(t+=i),t+"  </ul>\n</div>"},useData:!0}),s.vcard_default=a({1:function(a,s,n,l){var i=this.lambda,t=this.escapeExpression;return'    <li class="list-group-item">\n      <h4 class="list-group-item-heading">'+t(i(l&&l.key,a))+'</h4>\n      <p class="list-group-item-text">'+t(i(a,a))+"</p>\n    </li>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(a,s,n,l){var i,t='<div class="list">\n  <ul class="list-group">\n';return i=s.each.call(a,a,{name:"each",hash:{},fn:this.program(1,l),inverse:this.noop,data:l}),null!=i&&(t+=i),t+"  </ul>\n</div>"},useData:!0})}();