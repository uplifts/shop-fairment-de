class NotValidFieldException extends Error{constructor(e){super(`${e} does not have a valid Shopify field element as parent.`),this.name="NotValidFieldException"}}class NotImplementedError extends Error{constructor(e){let t=Error().stack.split("\n")[2].replace(" at ",""),s=`The method ${t} isn't implemented.`;e&&(s+=` Message: "${e}".`),super(s)}}class SelectionMethod extends HTMLDivElement{constructor(e){if(!(e instanceof HTMLDivElement)||!e.classList.contains("radio-wrapper"))throw TypeError("Not a radio-wrapper");return Object.setPrototypeOf(e,SelectionMethod.prototype),Object.assign(e,{type:"generic"})}addDescription(e){throw new NotImplementedError}get input(){let e=this.querySelector("input");return e||Error(`No input found for the ${this.type} method`)}get label(){return this.querySelector(".radio__label").textContent}get methodData(){return this.input.dataset}get methodId(){return this.input.id}get checked(){return this.input.checked}set checked(e){this.input.checked=e}remove(){this.parentElement.remove()}}class ShippingMethod extends SelectionMethod{constructor(e){super(e),Object.setPrototypeOf(this,ShippingMethod.prototype),this.type="shipping",this.addEventListener("change",()=>{let e=new CustomEvent("checkout:shippingmethod:changed",{detail:this});document.dispatchEvent(e)})}addDescription(e){let t=this.querySelector(".radio__label__primary"),s=document.createElement("span");s.classList.add("small-text"),s.innerHTML=e,t.appendChild(document.createElement("br")),t.appendChild(s)}get shippingRate(){return this.methodData.checkoutTotalShippingCents/100}get subtotalPrice(){return this.methodData.checkoutSubtotalPriceCents/100}}class PaymentMethod extends SelectionMethod{constructor(e){if(!e.dataset.selectGateway)throw new NotValidFieldException;super(e),Object.setPrototypeOf(this,PaymentMethod.prototype),this.type="payment",this.addEventListener("change",()=>{let e=new CustomEvent("checkout:paymentmethod:changed",{detail:this});document.dispatchEvent(e)})}addDescription(e){this.nextElementSibling.querySelector(".blank-slate").innerHTML=e}get methodData(){return this.dataset}get gatewayId(){return this.dataset.selectGateway}get gatewayName(){return this.dataset.gatewayName}}class BaseComponent extends HTMLDivElement{constructor(e=null){let t="component";e&&(t=e.type??"component");let s=document.createElement("div");return Object.setPrototypeOf(s,BaseComponent.prototype),Object.assign(s,{componentType:t})}insertAfter(e){if(!e||!(e instanceof BaseComponent))throw TypeError("Object trying to add is not a component.");this.insertAdjacentElement("afterend",e)}insertBefore(e){if(!e||!(e instanceof BaseComponent))throw TypeError("Object trying to add is not a component.");this.insertAdjacentElement("beforebegin",e)}}class BaseInputComponent extends BaseComponent{constructor(e=null){return super(e),Object.setPrototypeOf(this,BaseInputComponent.prototype),this}changed(e){let t=new CustomEvent(`checkout:${this.componentType}:changed`,{detail:{event:e,value:this.value}});this.dispatchEvent(t)}on(e,t){this.addEventListener(`checkout:${this.componentType}:${e}`,t,!1)}onValueChanged(e){this.on("changed",e)}}class FieldRetriever{retrieve(e){let t=null;if([".field",".checkbox-wrapper"].some(s=>{if(null!=(t=e.closest(s)))return!0})){let s={};if(t.classList.contains("field"))s=t;else{s=document.createElement("div");let i=t.parentElement;s.classList.add("field"),s.appendChild(t),i.appendChild(s)}return this._setFieldPropierties(s),s}throw new NotValidFieldException}_setFieldPropierties(e){e.children&&(e.wrapperClass=e.children[0].classList[0])}}class Field extends BaseInputComponent{constructor(e){super({type:"field"});let t={input:'[id^="checkout_"]',errorMessage:".field__message--error",wrapper:".field__input-wrapper"},s={wrapper:["field__input-wrapper"],field:["field","field--show-floating-label"],fieldInput:["field__input"],label:["field__label","field__label--visible"],fieldError:["field--error"],fieldErrorMessage:["field__message","field__message--error"],half:["field--half"]};if("string"==typeof e){let i=document.querySelector(`#${e}`),n=new FieldRetriever().retrieve(i);Object.setPrototypeOf(n,Field.prototype);return Object.assign(n,{componentType:this.componentType,fieldName:n.name,fieldId:n.id,selectors:t,classes:s})}if("object"==typeof e){let{name:r,label:o=r,isHalf:l}=e,a=`checkout_attributes_${r}`,d=`checkout[attributes][${r}]`,c=this;c.classList.add(...s.field),l&&c.classList.add(s.half);let p=document.createElement("div");p.classList.add(s.wrapper);let h=document.createElement("label");h.classList.add(...s.label),h.innerText=o,h.htmlFor=a,p.appendChild(h),c.appendChild(p),Object.setPrototypeOf(c,Field.prototype);return Object.assign(c,{fieldName:d,fieldId:a,selectors:t,classes:s})}}created(){this.addEventListener("input",this.changed);let e=new CustomEvent(`checkout:${this.componentType}:created`,{detail:this});document.dispatchEvent(e)}changed(e){let t=this.querySelector(this.selectors.input),s=new CustomEvent(`checkout:${this.componentType}:changed`,{detail:{event:e,input:t,value:t.value}});this.dispatchEvent(s)}addField(e){throw new NotImplementedError}showError(e){if(this.removeError(),this.classList.add(...this.classes.fieldError),e&&e.length>0){let t=document.createElement("p");t.classList.add(...this.classes.fieldErrorMessage),t.innerHTML=e,this.appendChild(t)}}removeError(){this.classList.remove(...this.classes.fieldError);this.querySelectorAll(this.selectors.errorMessage).forEach(e=>{e.remove()})}remove(){let e=new CustomEvent(`checkout:${this.componentType}:removed`,{detail:this});document.dispatchEvent(e),super.remove()}get value(){return this.querySelector(this.selectors.input).value}set value(e){this.querySelector(this.selectors.input).value=e,this.changed(new InputEvent("input:changed"))}}class Tooltip extends HTMLDivElement{constructor(e,t,s="#question"){let i={wrapper:["field__icon"],container:["tooltip-container"],tooltip:["tooltip"],button:["tooltip-control"],svgIcon:["icon-svg","icon-svg--color-adaptive-lighter","icon-svg--size-16","icon-svg--block","icon-svg--center"]},n=document.createElement("div");n.classList.add(...i.wrapper);let r=document.createElement("div");r.classList.add(...i.container);let o=document.createElement("span");o.id=`tooltip-for-${t}`,o.classList.add(...i.tooltip),o.innerText=e;let l=document.createElement("button");l.classList.add(...i.button),l.type="button";let a=document.createElementNS("http://www.w3.org/2000/svg","svg");a.classList.add(...i.svgIcon),a.setAttribute("role","presentation"),a.focusable="false";let d=document.createElementNS("http://www.w3.org/2000/svg","use");return d.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",s),d.setAttributeNS("http://www.w3.org/1999/xlink","href",s),a.appendChild(d),l.appendChild(a),r.appendChild(l),r.appendChild(o),n.appendChild(r),n}}class TextField extends Field{constructor(e){super(e),Object.setPrototypeOf(this,TextField.prototype),"object"==typeof e&&this.addField(e),this.created()}addField(e){let t=document.createElement("input");t.classList.add(...this.classes.fieldInput),t.placeholder=e.placeholder?e.placeholder:"",t.size=e.size?e.size:30,t.type=e.type?e.type:"text",t.value=e.defaultValue?e.defaultValue:"",t.name=this.fieldName,t.id=this.fieldId,this.querySelector(this.selectors.wrapper).appendChild(t),"string"==typeof e.tooltip&&this.addTooltip(e.tooltip)}addTooltip(e="",t="#question"){this.removeTooltip();let s=this.querySelector(this.selectors.wrapper);s.classList.add("field__input-wrapper--icon-right");let i=new Tooltip(e,this.fieldId,t);s.appendChild(i)}removeTooltip(){let e=this.querySelector(this.selectors.wrapper),t=e.querySelectorAll(".field__icon");e.classList.remove("field__input-wrapper--icon-right"),t.forEach(e=>{e.remove()})}}class CheckboxField extends Field{constructor(e){let t={input:'input[type="checkbox"]',wrapper:".checkbox-wrapper"},s={label:["checkbox__label"],fieldInputWrapper:["checkbox__input"],fieldInput:["input-checkbox"],wrapper:["checkbox-wrapper"]};if("object"==typeof e){e.type="checkbox",super(e);let i=this.querySelector(this.selectors.wrapper);i.classList.remove(...i.classList),i.classList.add(...s.wrapper),Object.setPrototypeOf(this,CheckboxField.prototype),Object.assign(this.classes,s),Object.assign(this.selectors,t);let n="boolean"==typeof e.checked&&e.checked;this.addField(n)}else super(e),Object.setPrototypeOf(this,CheckboxField.prototype),Object.assign(this.classes,s),Object.assign(this.selectors,t);this.created()}addField(e){let t=this.querySelector(this.selectors.wrapper),s=t.querySelector("label");s.classList.remove(...s.classList),s.classList.add(...this.classes.label);let i=document.createElement("div");i.classList.add(...this.classes.fieldInputWrapper);let n=document.createElement("input");n.classList.add(...this.classes.fieldInput),n.type="checkbox",n.checked=e,n.name=this.fieldName,n.id=this.fieldId,i.appendChild(n),t.insertBefore(i,s)}get checked(){return this.querySelector(this.selectors.input).checked}set checked(e){this.querySelector(this.selectors.input).checked=e}}class DropdownField extends Field{constructor(e){let t={field:["field","field--show-floating-label"],fieldInput:["field__input","field__input--select"],fieldInputWrapper:["field__input-wrapper","field__input-wrapper--select"],arrow:["field__caret","shown-if-js"],svgIcon:["icon-svg","icon-svg--color-adaptive-lighter","icon-svg--size-10","field__caret-svg"]};super(e),Object.setPrototypeOf(this,DropdownField.prototype),Object.assign(this.classes,t),"object"==typeof e&&this.addField(e),this.created()}addField(e){if(!e.options)throw ReferenceError("No options defined for DropdownField");this.classList.add(...this.classes.field);let t=this.querySelector(this.selectors.wrapper);t.classList.add(...this.classes.fieldInputWrapper);let s=document.createElement("select");if(s.classList.add(...this.classes.fieldInput),s.placeholder=e.placeholder?e.placeholder:"",s.name=this.fieldName,s.id=this.fieldId,e.defaultValue){let i=document.createElement("option");i.disabled=!0,i.selected=!0,i.innerText=e.defaultValue,s.add(i),s.placeholder=e.placeholder?e.placeholder:e.defaultValue}e.options.forEach(e=>{let t=document.createElement("option");t.innerText=e.text,t.value=e.value,s.add(t)});let n=document.createElement("div");n.classList.add(...this.classes.arrow);let r=document.createElementNS("http://www.w3.org/2000/svg","svg");r.classList.add(...this.classes.svgIcon),r.setAttribute("role","presentation"),r.focusable="false";let o=document.createElementNS("http://www.w3.org/2000/svg","use");o.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#caret-down"),o.setAttributeNS("http://www.w3.org/1999/xlink","href","#caret-down"),r.appendChild(o),n.appendChild(r),t.appendChild(s),t.appendChild(n)}}class FieldFactory{constructor(){}createFieldByElement(e){switch(e.type){case"text":case"email":case"tel":return new TextField(e.id);case"checkbox":return new CheckboxField(e.id);case"select-one":return new DropdownField(e.id);case"hidden":return null;default:try{return new Field(e.id)}catch(t){if(t instanceof NotValidFieldException)return null;throw t}}}}class Checkout{constructor(){this.fields=[],this.Steps={INFORMATION:"contact_information",SHIPPING:"shipping_method",PAYMENT:"payment_method",PROCESSING:"processing",THANKYOU:"thank_you",ORDERSTATUS:"order_status",STOCK_PROBLEMS:"stock_problems"},this.selectors={inputs:"input[id], select[id]",selectionMethods:".section--{TYPE}-method .radio-wrapper",fields:'[id^="checkout_"]',stockProblem:{list:".stock-problem-table .product__description",name:".product__description__name",description:".product__description__variant"}},this.lastStep=this._getLastStep(),this.currentStep=this._getCurrentStep(),document.addEventListener("page:load",this._onLoad.bind(this),!1),document.addEventListener("page:change",this._onLoad.bind(this),!1),document.addEventListener("checkout:field:created",this._fieldCreated.bind(this),!1),document.addEventListener("checkout:field:removed",this._fieldRemoved.bind(this),!1),document.querySelector("[type=submit]")&&document.querySelector("[type=submit]").parentElement.closest("form").addEventListener("submit",this._onContinue.bind(this),!0),this.fields=this._getFields()}_getFields(){let e=[],t=document.querySelectorAll(this.selectors.inputs),s=new FieldFactory;return t.forEach(t=>{try{let i=s.createFieldByElement(t);null!=i&&(e[t.id]=i)}catch(n){console.error(n)}}),e}_getLastStep(){let e=sessionStorage.getItem("step");return null==e&&document.referrer&&document.referrer.length>2&&(e=new URL(document.referrer).pathname),e}_getCurrentStep(){let e=Shopify.Checkout.step;return"stock_problems"==Shopify.Checkout.page&&(e=this.Steps.STOCK_PROBLEMS),void 0!==Shopify.Checkout.OrderStatus&&(e="thank_you"==Shopify.Checkout.page?this.Steps.THANKYOU:this.Steps.ORDERSTATUS),sessionStorage.setItem("step",e),e}_triggerEvent(e,t={}){let s=new CustomEvent(`checkout:${e}`,{detail:t});document.dispatchEvent(s)}_getSelectionMethods(e){let t=document.querySelectorAll(this.selectors.selectionMethods.replace("{TYPE}",e)),s=[];return t.forEach(t=>{try{"shipping"==e?s.push(new ShippingMethod(t)):"payment"==e&&s.push(new PaymentMethod(t))}catch(i){if(!(i instanceof NotValidFieldException))throw i}}),s}_getStockProblemList(){let e=document.querySelectorAll(this.selectors.stockProblem.list),t=[];for(let s of e){let i=s.querySelector(this.selectors.stockProblem.name).innerText,n=s.querySelector(this.selectors.stockProblem.description).innerText;t.push({name:i,variant:n})}return t}_onContinue(e){this._triggerEvent("continue",{innerEvent:e})}_onLoad(e){try{switch(this._triggerEvent("load"),this.currentStep){case this.Steps.INFORMATION:this._triggerEvent("load:information");break;case this.Steps.SHIPPING:{let t=this._getSelectionMethods("shipping");this._triggerEvent("load:shipping",{shippingMethods:t});break}case this.Steps.PAYMENT:{let s=this._getSelectionMethods("payment");this._triggerEvent("load:payment",{paymentMethods:s});break}case this.Steps.PROCESSING:this._triggerEvent("load:processing");break;case this.Steps.THANKYOU:this._triggerEvent("load:thankyou");break;case this.Steps.ORDERSTATUS:this._triggerEvent("load:orderstatus");break;case this.Steps.STOCK_PROBLEMS:var i=this._getStockProblemList();this._triggerEvent("load:stockproblems",{stockProblemList:i})}}catch(n){this._triggerEvent("error",{step:this.currentStep,event:e,error:n})}}_fieldCreated(e){let t=e.detail,s=t.querySelector(this.selectors.fields);if(null!=s){let i=Object.prototype.hasOwnProperty.call(this.fields,s.id);this.fields&&!i&&(this.fields[s.id]=t)}}_fieldRemoved(e){let t=e.detail.querySelector(this.selectors.fields),s=Object.prototype.hasOwnProperty.call(this.fields,t.id);this.fields&&s&&delete this.fields[t.id]}on(e,t){document.addEventListener(`checkout:${e}`,t,!1)}}class ReferenceNotDefinedException extends Error{constructor(e){super(`ReferenceError: ${e} is not defined.`),this.name="ReferenceNotDefinedException"}}class RadioSelectorField extends BaseInputComponent{constructor(e){super(e);let t={input:"input"},s={wrapper:["radio-wrapper"],input:["radio__input"],radioInput:["input-radio"],radioLabel:["radio__label"]};if(null==e.name)throw new ReferenceNotDefinedException("args.name");if(null==e.value)throw new ReferenceNotDefinedException("args.value");if(null==e.id)throw new ReferenceNotDefinedException("args.id");if(null==e.label&&null==e.innerHTML)throw new ReferenceNotDefinedException("args.label || args.innerHTML");let i=e.id,n=e.value,r=`checkout[attributes][${e.name}]`,o=`checkout_attributes_${e.name}`;this.classList.add(s.wrapper),Object.setPrototypeOf(this,RadioSelectorField.prototype);let l=Object.assign(this,{selectors:t,classes:s,fieldName:r,fieldId:o,value:n,radioId:i});return"object"==typeof e&&l.addField(e),l}addField(e){let t=this._createInput(e.id),s=this._createLabel(e);this.appendChild(t),this.appendChild(s)}_createInput(e){let t=document.createElement("div");t.classList.add(...this.classes.input);let s=document.createElement("input");return s.classList.add(...this.classes.radioInput),s.type="radio",s.value=this.value,s.name=this.fieldName,s.id=e,s.addEventListener("input",this.changed.bind(this)),t.appendChild(s),t}_createLabel(e){let{label:t,id:s,innerHTML:i}=e,n=document.createElement("label");n.classList.add(...this.classes.radioLabel),n.htmlFor=s;let r=document.createElement("span");return r.textContent=t,null!=i&&(r.innerHTML=i),n.appendChild(r),n}get checked(){return this.querySelector(this.selectors.input).checked}set checked(e=!0){this.querySelector(this.selectors.input).checked=e,this.changed(new InputEvent("checked:changed"))}}class RadioContentBoxComponent extends BaseInputComponent{constructor(e){super();let t={checked:"[type=radio]:checked",radioType:"[type=radio]",allOptions:".content-box__row"},s={box:["content-box"],row:["content-box__row"]},i=0,n=[],r=`checkout[attributes][${e.name}]`,o=`checkout_attributes_${e.name}`,l=e.name;return this.classList.add(s.box),Object.setPrototypeOf(this,RadioContentBoxComponent.prototype),Object.assign(this,{selectors:t,classes:s,fieldName:r,fieldId:o,name:l,optionCount:i,options:n})}addOption(e){if(null==e.label&&null==e.innerHTML)throw new ReferenceNotDefinedException("args.label || args.innerHTML");let t=document.createElement("row");t.classList.add(...this.classes.row),e.name=this.name,e.id=`${this.fieldId}_${++this.optionCount}`;let s=new RadioSelectorField(e);s.on("changed",this.changed.bind(this)),this.options.push(s),t.appendChild(s),this.appendChild(t),1==this.optionCount&&(this.firstChild.querySelector(this.selectors.radioType).checked=!0,s.changed.bind(this)(new InputEvent("FirstOptionSelected")))}removeAllOptions(){this.querySelectorAll(this.selectors.allOptions).forEach(e=>{e.remove()}),this.options=[],this.optionCount=0}remove(){let e=new CustomEvent(`checkout:${this.componentType}:removed`,{detail:this});document.dispatchEvent(e),super.remove()}get value(){let e=this.querySelector(this.selectors.checked);return e?e.value:null}}class SectionComponent extends BaseComponent{constructor(e=null){super(e);let{title:t,name:s,selector:i}=e,n={contentDivs:".section__content"},r={section:["section",`section--${s}`],header:["section__header"],content:["section__content"],title:["section__title"]},o=!0,l=[];if(null!=i){let a=document.querySelector(i);if(null!=a){let d=a.querySelector(n.contentDivs);return l.push(d),Object.setPrototypeOf(a,SectionComponent.prototype),Object.assign(a,{selectors:n,classes:r,isVisible:o,contentDivs:l})}}this.classList.add(...r.section);let c=document.createElement("div");c.classList.add(...r.header);let p=document.createElement("h2");p.classList.add(...r.title),p.textContent=t,c.appendChild(p);let h=document.createElement("div");return h.classList.add(...r.content),l.push(h),this.appendChild(c),this.appendChild(h),Object.setPrototypeOf(this,SectionComponent.prototype),Object.assign(this,{selectors:n,classes:r,isVisible:o,contentDivs:l})}addContent(e,t=0){if(!e||!(e instanceof BaseComponent))throw TypeError("Object trying to add is not a component.");this.contentDivs[t].appendChild(e)}addSectionContentDiv(){let e=document.createElement("div");return e.classList.add(...this.classes.content),this.contentDivs.push(e),this.appendChild(e),this.contentDivs.length-1}hide(){this.classList.add("hidden-if-js"),this.isVisible=!this.isVisible}show(){this.classList.remove("hidden-if-js"),this.isVisible=!this.isVisible}toggle(){this.isVisible?this.hide():this.show()}}let $checkout=new Checkout;export{$checkout,BaseComponent,BaseInputComponent,CheckboxField,DropdownField,PaymentMethod,RadioContentBoxComponent,SectionComponent,ShippingMethod,TextField};

function msToSecondsOnly(str) {
  var p = str.split(':'),
    s = 0, m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

function fancyTimeFormat(duration) {   
    // Hours, minutes and seconds
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

document.addEventListener('DOMContentLoaded', function() {
  let step = Shopify.Checkout.step;
  let countdownTimer = document.querySelectorAll('.countdownTimer');
  let stepContact = document.querySelector('.breadcrumb-item[data-breadcrumb-step="contact_information"]');
  let stepShipping = document.querySelector('.breadcrumb-item[data-breadcrumb-step="shipping_method"]');
  let stepPayment = document.querySelector('.breadcrumb-item[data-breadcrumb-step="payment_method"]');
  let stepSuccess = document.querySelector('.breadcrumb-item[data-breadcrumb-step="thank_you"]');
  let secondPaymentMethodTrigger = document.querySelector('.radio-wrapper[data-select-gateway="65921155262"] .input-radio');

  if (step) {
    document.documentElement.setAttribute('data-current-step', step);
    switch (step) {
      case 'contact_information':
        stepContact.classList.remove('mod-blank');
        stepContact.classList.add('mod-current');

        break;
      case 'shipping_method':
        stepContact.classList.remove('mod-blank');
        stepContact.classList.add('mod-completed');
        stepShipping.classList.remove('mod-blank');
        stepShipping.classList.add('mod-current');
        countdownTimer && countdownTimer.forEach((el) => {
          el.classList.add('d-none');
        });
        
        break;
      case 'payment_method':
        stepContact.classList.remove('mod-blank');
        stepContact.classList.add('mod-completed');
        stepShipping.classList.remove('mod-blank');
        stepShipping.classList.add('mod-completed');
        stepPayment.classList.remove('mod-blank');
        stepPayment.classList.add('mod-current');
        countdownTimer && countdownTimer.forEach((el) => {
          el.classList.add('d-none');
        });
        
        break;
    
      default:
        break;
    }
  }
  if (document.documentElement.classList.contains('page--thank-you')) {
    document.documentElement.setAttribute('data-current-step', 'thank_you');
    stepContact.classList.remove('mod-blank');
    stepContact.classList.add('mod-completed');
    stepShipping.classList.remove('mod-blank');
    stepShipping.classList.add('mod-completed');
    stepPayment.classList.remove('mod-blank');
    stepPayment.classList.add('mod-completed');
    stepSuccess.classList.remove('mod-blank');
    stepSuccess.classList.add('mod-completed');
  }

  const textColumnsCheckout = document.querySelector('.textColumnsCheckout');
  const summary = document.querySelector('#order-summary');
  const textColsCheckoutMobile = document.querySelector('.textColumnsCheckoutMobileTarget');
  if (textColumnsCheckout && summary) {
    summary.appendChild(textColumnsCheckout.cloneNode(true));
  }
  if (textColumnsCheckout && textColsCheckoutMobile) {
    textColsCheckoutMobile.appendChild(textColumnsCheckout.cloneNode(true));
  }
  
  if (secondPaymentMethodTrigger) {
    secondPaymentMethodTrigger.click();
  }

  const checkoutSupportBoxEl = document.querySelector('.checkoutSupportBoxEl');
  const checkoutSupportBoxMain = document.querySelector('.checkoutSupportBoxMain');
  if (checkoutSupportBoxEl && checkoutSupportBoxMain) {
    checkoutSupportBoxMain.appendChild(checkoutSupportBoxEl.cloneNode(true));
  }

  // Countdown timer
  var timerCounter = document.querySelectorAll('.timerCounter');
  if (timerCounter) {
    timerCounter.forEach(el => {
      let countdownPanel = el.closest('.countdownPanel');
      let originalText = countdownPanel.querySelector('.originalText');
      let expiredText = countdownPanel.querySelector('.expiredText');
      var timeRaw = el.dataset.time || '15:00';
      var time = msToSecondsOnly(timeRaw);

      var x = setInterval(function() {      
        // Display the result in the element with id="demo"
        el.innerHTML = fancyTimeFormat(time);

        time--;
      
        // If the count down is finished, write some text
        if (time < 0) {
          clearInterval(x);
          if (originalText && expiredText) {
            originalText.classList.add('d-none');
            expiredText.classList.remove('d-none');
          } else {
            countdownPanel && countdownPanel.classList.add('d-none');
          }
        }
      }, 1000);
    });
  }
});
// Adding Discount below Breadcrumbs

// discount();
//         function discount(){
//         let saving = document.getElementById('saving');

//          saving.innerHTML = document.getElementsByClassName("visually-hidden skeleton-while-loading-sr")[0].innerHTML.replace('&nbsp;€ Rabatt auf den Gesamtpreis','');
          
//         }

const handleDiscountSuccessMessage = (discountDataEl, discountNumberEl) => {
  if (discountDataEl) {
    let discountMoney = discountDataEl.dataset.checkoutDiscountAmountTarget;
    discountNumberEl.forEach(el => {
      el.innerHTML = Number(discountMoney) / 100;
    });
    document.documentElement.classList.add('discount-applied');
  } else {
    document.documentElement.classList.remove('discount-applied');
  }
}

const discountSuccessMessageRoot = document.querySelector('.discountSuccessMessageRoot');
const discountSuccessMessage1 = document.querySelector('.checkout-breadcrumbs');
const discountSuccessMessage2 = document.querySelector('.order-summary__section--discount');
const orderTotalWrapper = document.querySelector('.order-summary__section--discount');

if (discountSuccessMessage1) {
  discountSuccessMessage1.appendChild(discountSuccessMessageRoot.cloneNode(true));
}
if (discountSuccessMessage2) {
  discountSuccessMessage2.appendChild(discountSuccessMessageRoot.cloneNode(true));
}

var observedElement = document.querySelector('html');
var changesObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      // Do some stuff
      setTimeout(() => {
        let discountNumberLineEl = document.querySelector('[data-checkout-discount-amount-target]');
        let discountTotalTargets = document.querySelectorAll('.discountTotal');
        if (discountTotalTargets) {
          console.log('discountTotalTargets');
          console.log(discountNumberLineEl);
          handleDiscountSuccessMessage(discountNumberLineEl, discountTotalTargets);
        }
      }, 500)
    }
  });
});
var changesObserverConfig = { attributes: true, childList: true, characterData: true }

if (observedElement) {
  changesObserver.observe(observedElement, changesObserverConfig);
}

document.addEventListener('DOMContentLoaded', () => {
  let discountNumberLineEl = document.querySelector('[data-checkout-discount-amount-target]');
  let discountTotalTargets = document.querySelectorAll('.discountTotal');
  if (discountTotalTargets) {
    console.log('discountTotalTargets');
    console.log(discountNumberLineEl);
    handleDiscountSuccessMessage(discountNumberLineEl, discountTotalTargets);
  }
});

$checkout.on('load', (e) => { console.log(e); })
$checkout.on('field:changed', (e) => { console.log(e); })
$checkout.on('field:created', (e) => { console.log(e); })
$checkout.on('field:removed', (e) => { console.log(e); })