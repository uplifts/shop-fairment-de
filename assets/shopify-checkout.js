class NotValidFieldException extends Error {
  constructor(value) {
      let message = `${value} does not have a valid Shopify field element as parent.`;
      super(message);

      this.name = 'NotValidFieldException';
  }
}

class NotImplementedError extends Error {
  constructor(message) {
      const sender = (new Error)
          .stack
          .split('\n')[2]
          .replace(' at ', '')
          ;

      let error = `The method ${sender} isn't implemented.`;
      if (message) error += ` Message: "${message}".`;

      super(error);
  }
}

class SelectionMethod extends HTMLDivElement{

  constructor(element){
      if(!(element instanceof HTMLDivElement)
          || !element.classList.contains('radio-wrapper')){
          throw TypeError('Not a radio-wrapper');
      }

      Object.setPrototypeOf(element, SelectionMethod.prototype);
      return Object.assign(element, {
          type: 'generic'
      });
  }

  /**
   * Add a `text` decription to the selection method
   * @param {string} text 
   */
  // eslint-disable-next-line no-unused-vars
  addDescription(text){
      throw new NotImplementedError();
  }

  get input(){
      let input = this.querySelector('input');
      if(!input) return Error(`No input found for the ${this.type} method`);
      return input;
  }

  get label(){
      return this.querySelector('.radio__label').textContent;
  }

  get methodData(){
      return this.input.dataset;
  }

  get methodId(){
      return this.input.id;
  }

  get checked(){
      return this.input.checked;
  }

  set checked(boolean){
      this.input.checked = boolean;
  }

  /**
   * Remove the selection method
   */
  remove()
  {
      this.parentElement.remove();
  }
}

class ShippingMethod extends SelectionMethod{
  constructor(element){
      super(element);
      Object.setPrototypeOf(this, ShippingMethod.prototype);

      this.type = 'shipping';
      this.addEventListener('change', () => {
          let event = new CustomEvent(`checkout:shippingmethod:changed`, { detail: this });
          document.dispatchEvent(event);
      });
  }

  addDescription(text){
      let span = this.querySelector('.radio__label__primary');
      let desc = document.createElement('span');
      desc.classList.add('small-text');
      desc.innerHTML = text;

      span.appendChild(document.createElement('br'));
      span.appendChild(desc);
  }

  /**
   * Get the Shipping rate value
   */
  get shippingRate(){
      return this.methodData.checkoutTotalShippingCents/100;
  }

  /**
   * Get the subtotal price value
   */
  get subtotalPrice(){
      return this.methodData.checkoutSubtotalPriceCents/100;
  }
}

class PaymentMethod extends SelectionMethod{
  constructor(element){
      if(!element.dataset.selectGateway) 
          throw new NotValidFieldException();

      super(element);
      Object.setPrototypeOf(this, PaymentMethod.prototype);

      this.type = 'payment';
      this.addEventListener('change', () => {
          let event = new CustomEvent(`checkout:paymentmethod:changed`, { detail: this });
          document.dispatchEvent(event);
      });
  }

  addDescription(text){
      let desc = this.nextElementSibling.querySelector('.blank-slate');
      desc.innerHTML = text;
  }

  get methodData(){
      return this.dataset;
  }

  /**
   * Get the gateway ID value
   */
  get gatewayId(){
      return this.dataset.selectGateway;
  }

  /**
   * Get the gateway name value
   */
  get gatewayName(){
      return this.dataset.gatewayName;
  }
}

class BaseComponent extends HTMLDivElement{
  constructor(args = null)
  {
      let componentType = 'component';
      if(args)
      {
          componentType = args.type ?? 'component'; 
      }
      
      let element = document.createElement('div');
      Object.setPrototypeOf(element, BaseComponent.prototype);

      return Object.assign(element, {
          componentType
      });
  }

  /**
   * Insert the current component after the specified component parameter.
   * @param {BaseComponent} component 
   * @throws {TypeError} Object trying to add is not a component
   */
  insertAfter(component){
      if(!component || !(component instanceof BaseComponent)) throw TypeError('Object trying to add is not a component.');
      this.insertAdjacentElement('afterend', component);
  }

  /**
   * Insert the current component before the specified component parameter.
   * @param {BaseComponent} component 
   * @throws {TypeError} Object trying to add is not a component
   */
  insertBefore(component){
      if(!component || !(component instanceof BaseComponent)) throw TypeError('Object trying to add is not a component.');
      this.insertAdjacentElement('beforebegin', component);
  }
}

class BaseInputComponent extends BaseComponent{
  constructor(args = null)
  {
      super(args);
      Object.setPrototypeOf(this, BaseInputComponent.prototype);

      return this;
  }

  changed(innerEvent){
      let event = new CustomEvent(`checkout:${this.componentType}:changed`, { detail: 
          {
              event: innerEvent,
              value: this.value
          }
      });
      this.dispatchEvent(event);
  }

  /**
   * Add an event listener to a specific event
   * @param {string} event Event name 
   * @param {function} callback Callback function to execute when event triggers
   */
  on(event, callback){
      this.addEventListener(`checkout:${this.componentType}:${event}`, callback, false);
  }

  /**
   * Call a callback when the value of the component changes.
   * @param {function} callback Callback function to execute when the component changes
   */
  onValueChanged(callback){
      this.on(`changed`, callback);
  }
}

/* eslint-disable constructor-super */

class FieldRetriever {
  retrieve(inputElement){
      let possibleParentsClasses = [
          '.field',
          '.checkbox-wrapper'
      ];

      let element = null;
      let found = possibleParentsClasses.some( className => {
          element = inputElement.closest(className);
          if(element != null) return true;
      });

      if(found){ 
          let field = {};
          if(!element.classList.contains('field')) {
              field = document.createElement('div');
              let parent = element.parentElement;

              field.classList.add('field');
              field.appendChild(element);
              parent.appendChild(field);
          }else {
              field = element;
          }
          this._setFieldPropierties(field);
          return field;
      }
      else throw new NotValidFieldException();
  }

  _setFieldPropierties(field){
      if(!field.children) return;
      field.wrapperClass = field.children[0].classList[0];
  }
}

class Field extends BaseInputComponent{
  constructor(args){
      super({ type: 'field' });

      let selectors = {
          input: '[id^="checkout_"]',
          errorMessage: '.field__message--error',
          wrapper: '.field__input-wrapper',
      };

      let classes = {
          wrapper: ['field__input-wrapper'],
          field: ['field', 'field--show-floating-label'],
          fieldInput: ['field__input'],
          label: ['field__label', 'field__label--visible'],
          fieldError: ['field--error'],
          fieldErrorMessage: ['field__message', 'field__message--error'],
          half: ['field--half'],
      };

      if(typeof args == 'string'){       
          let input = document.querySelector(`#${args}`);
          let element = new FieldRetriever().retrieve(input);
          Object.setPrototypeOf(element, Field.prototype);

          let field = Object.assign(element, {
              componentType: this.componentType,
              fieldName: element.name,
              fieldId: element.id,
              selectors,
              classes,
          });

          return field;
      }else if (typeof args == 'object'){
          const { name, label = name, isHalf } = args;

          let fieldId = `checkout_attributes_${name}`;
          let fieldName = `checkout[attributes][${name}]`;

          let element = this;
          element.classList.add(...classes.field);
          if(isHalf) element.classList.add(classes.half);

          let wrapperElement = document.createElement('div');
          wrapperElement.classList.add(classes.wrapper);

          let labelElement = document.createElement('label');
          labelElement.classList.add(...classes.label);
          labelElement.innerText = label;
          labelElement.htmlFor = fieldId;

          wrapperElement.appendChild(labelElement);
          element.appendChild(wrapperElement);

          Object.setPrototypeOf(element, Field.prototype);
          let field = Object.assign(element, {
              fieldName: fieldName,
              fieldId: fieldId,
              selectors,
              classes,
          });
          
          return field;
      }
  }

  created(){
      this.addEventListener("input", this.changed);

      let event = new CustomEvent(`checkout:${this.componentType}:created`, { detail: this });
      document.dispatchEvent(event);
  }

  changed(innerEvent){
      let input = this.querySelector(this.selectors.input);
      let event = new CustomEvent(`checkout:${this.componentType}:changed`, { detail: 
          {
              event: innerEvent,
              input: input,
              value: input.value
          }
      });
      this.dispatchEvent(event);
  }

  // eslint-disable-next-line no-unused-vars
  addField(args){
      throw new NotImplementedError();
  }

  /**
   * Displays an error message for the field.
   * @param {string} message Error message to display
   */
  showError(message){
      this.removeError();
      this.classList.add(...this.classes.fieldError);

      if(message && message.length > 0){
          let errorElement = document.createElement('p');
          errorElement.classList.add(...this.classes.fieldErrorMessage);
          errorElement.innerHTML = message;

          this.appendChild(errorElement);
      }
  }

  /**
   * Removes the errores for the field.
   */
  removeError(){
      this.classList.remove(...this.classes.fieldError);

      let errorElements = this.querySelectorAll(this.selectors.errorMessage);
      errorElements.forEach( (element) => {
          element.remove();
      });
  }

  /**
   * Removes the field from the page and fires the 'removed' event.
   */
  remove(){
      let event = new CustomEvent(`checkout:${this.componentType}:removed`, { detail: this });
      document.dispatchEvent(event);
      super.remove();
  }

  get value(){
      return this.querySelector(this.selectors.input).value;
  }

  set value(val){
      let input = this.querySelector(this.selectors.input);
      input.value = val;
      this.changed(new InputEvent('input:changed'));
  }
}

class Tooltip extends HTMLDivElement{
  constructor(text, fieldId, icon = '#question'){
      let classes = {
          wrapper: ['field__icon'],
          container: ['tooltip-container'],
          tooltip: ['tooltip'],
          button: ['tooltip-control'],
          svgIcon: ['icon-svg', 'icon-svg--color-adaptive-lighter','icon-svg--size-16', 'icon-svg--block', 'icon-svg--center'],
      };

      let tooltipDiv = document.createElement('div');
      tooltipDiv.classList.add(...classes.wrapper);

      let tooltipContainer = document.createElement('div');
      tooltipContainer.classList.add(...classes.container);

      let tooltipSpan = document.createElement('span');
      tooltipSpan.id = `tooltip-for-${fieldId}`;
      tooltipSpan.classList.add(...classes.tooltip);
      tooltipSpan.innerText = text;

      let button = document.createElement('button');
      button.classList.add(...classes.button);
      button.type = 'button';
      
      let iconSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
      iconSVG.classList.add(...classes.svgIcon);
      iconSVG.setAttribute('role', 'presentation');
      iconSVG.focusable = 'false';
      
      let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', icon);
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon);
      
      iconSVG.appendChild(use);
      button.appendChild(iconSVG);
      tooltipContainer.appendChild(button);
      tooltipContainer.appendChild(tooltipSpan);
      tooltipDiv.appendChild(tooltipContainer);

      return tooltipDiv;
  }
}

class TextField extends Field{
  constructor(args){
      super(args);
      Object.setPrototypeOf(this, TextField.prototype);

      if (typeof args == 'object'){
          this.addField(args);    
      }

      this.created();    
  }

  addField(args){
      let input = document.createElement('input');
      input.classList.add(...this.classes.fieldInput);
      input.placeholder = (args.placeholder) ? args.placeholder : '';
      input.size = (args.size) ? args.size : 30;
      input.type = (args.type) ? args.type : 'text';
      input.value = (args.defaultValue) ? args.defaultValue : '';

      input.name = this.fieldName;
      input.id = this.fieldId;
      
      this.querySelector(this.selectors.wrapper).appendChild(input);

      if(typeof args.tooltip == 'string'){
          this.addTooltip(args.tooltip);
      }
  }

  addTooltip(text = '', icon = '#question'){
      this.removeTooltip();

      const wrapper = this.querySelector(this.selectors.wrapper);
      wrapper.classList.add('field__input-wrapper--icon-right');

      let tooltip = new Tooltip(text, this.fieldId, icon);
      wrapper.appendChild(tooltip);
  }

  removeTooltip(){
      const wrapper = this.querySelector(this.selectors.wrapper);
      const tooltips = wrapper.querySelectorAll('.field__icon');

      wrapper.classList.remove('field__input-wrapper--icon-right');
      tooltips.forEach(element => {
          element.remove();
      });
  }
}

class CheckboxField extends Field{
  constructor(args){
      let selectors = {
          input: 'input[type="checkbox"]',
          wrapper: '.checkbox-wrapper',
      };

      let classes = {
          label: ['checkbox__label'],
          fieldInputWrapper: ['checkbox__input'],
          fieldInput: ['input-checkbox'],
          wrapper: ['checkbox-wrapper'],
      };

      if (typeof args == 'object'){
          args.type = 'checkbox';

          super(args);
          let wrapper = this.querySelector(this.selectors.wrapper);
          wrapper.classList.remove(...wrapper.classList);
          wrapper.classList.add(...classes.wrapper);

          Object.setPrototypeOf(this, CheckboxField.prototype);
          Object.assign(this.classes, classes);
          Object.assign(this.selectors, selectors);

          let checked = (typeof args.checked == 'boolean') ? args.checked : false;
          this.addField(checked);
      }else {
          super(args);
          Object.setPrototypeOf(this, CheckboxField.prototype);
          Object.assign(this.classes, classes);
          Object.assign(this.selectors, selectors);
      }
      
      this.created();
  }

  addField(checked){
      let wrapper = this.querySelector(this.selectors.wrapper);

      let label = wrapper.querySelector('label');
      label.classList.remove(...label.classList);
      label.classList.add(...this.classes.label);

      let div = document.createElement('div');
      div.classList.add(...this.classes.fieldInputWrapper);

      let input = document.createElement('input');
      input.classList.add(...this.classes.fieldInput);
      input.type = 'checkbox';
      input.checked = checked;

      input.name = this.fieldName;
      input.id = this.fieldId;

      div.appendChild(input);
      wrapper.insertBefore(div, label);
  }

  /**
   * Returns the state of the checkbox
   * @returns {boolean}
   */
  get checked(){
      let checkbox = this.querySelector(this.selectors.input);
      return checkbox.checked;
  }

  /**
   * Sets the state of the checkbox
   * @param {boolean} checked
   */
  set checked(checked){
      let checkbox = this.querySelector(this.selectors.input);
      checkbox.checked = checked;
  }
}

class DropdownField extends Field{
  constructor(args){
      let classes = {
          field: ['field', 'field--show-floating-label'],
          fieldInput: ['field__input', 'field__input--select'],
          fieldInputWrapper: ['field__input-wrapper', 'field__input-wrapper--select'],
          arrow: ['field__caret', 'shown-if-js'],
          svgIcon: ['icon-svg', 'icon-svg--color-adaptive-lighter','icon-svg--size-10', 'field__caret-svg'],
      };

      super(args);
      Object.setPrototypeOf(this, DropdownField.prototype);
      Object.assign(this.classes, classes);

      if (typeof args == 'object'){
          this.addField(args);
      }

      this.created();
  }

  addField(args){
      if(!args.options) throw new ReferenceError('No options defined for DropdownField');

      this.classList.add(...this.classes.field);
      const wrapper = this.querySelector(this.selectors.wrapper);
      wrapper.classList.add(...this.classes.fieldInputWrapper);

      let input = document.createElement('select');
      input.classList.add(...this.classes.fieldInput);
      input.placeholder = (args.placeholder) ? args.placeholder : '';
      input.name = this.fieldName;
      input.id = this.fieldId;

      if(args.defaultValue){
          const defaultOption = document.createElement("option");
          defaultOption.disabled = true;
          defaultOption.selected = true;
          defaultOption.innerText = args.defaultValue;
          
          input.add(defaultOption);
          input.placeholder = (args.placeholder) ? args.placeholder : args.defaultValue;
      }

      args.options.forEach(option => {
          let o = document.createElement("option");
          o.innerText = option.text;
          o.value = option.value;
          input.add(o);
      });

      let arrow = document.createElement('div');
      arrow.classList.add(...this.classes.arrow);
      
      let iconSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
      iconSVG.classList.add(...this.classes.svgIcon);
      iconSVG.setAttribute('role', 'presentation');
      iconSVG.focusable = 'false';
      
      let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#caret-down');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#caret-down');
      
      iconSVG.appendChild(use);
      arrow.appendChild(iconSVG);
      
      wrapper.appendChild(input);
      wrapper.appendChild(arrow);
  }
}

class FieldFactory {
  constructor(){ }

  createFieldByElement(element){
      switch (element.type) {
          case 'text':
              return new TextField(element.id);
          case 'email':
              return new TextField(element.id);
          case 'tel':
              return new TextField(element.id);
          case 'checkbox':
              return new CheckboxField(element.id);
          case 'select-one':
              return new DropdownField(element.id);
          case 'hidden':
              return null;
          default:
              try{
                  return new Field(element.id);
              }catch(e){
                  if(e instanceof NotValidFieldException) return null;
                  else throw e;
              }
      }
  }
}

/* eslint-disable no-undef */

class Checkout {
  constructor(){
      this.fields = [];

      this.Steps = {
          INFORMATION: 'contact_information',
          SHIPPING: 'shipping_method',
          PAYMENT: 'payment_method',
          PROCESSING: 'processing',
          THANKYOU: 'thank_you',
          ORDERSTATUS: 'order_status',
          STOCK_PROBLEMS: 'stock_problems',
      };

      this.selectors ={
          inputs: 'input[id], select[id]',
          selectionMethods: '.section--{TYPE}-method .radio-wrapper',
          fields: '[id^="checkout_"]',
          stockProblem: {
              list: '.stock-problem-table .product__description',
              name: '.product__description__name',
              description: '.product__description__variant',
          },
      };

      this.lastStep = this._getLastStep();
      this.currentStep = this._getCurrentStep();

      document.addEventListener('page:load', this._onLoad.bind(this), false);
      document.addEventListener('page:change', this._onLoad.bind(this), false);
      document.addEventListener('checkout:field:created', this._fieldCreated.bind(this), false);
      document.addEventListener('checkout:field:removed', this._fieldRemoved.bind(this), false);

      if(document.querySelector('[type=submit]'))
      {
          let form = document.querySelector('[type=submit]').parentElement.closest("form");
          form.addEventListener('submit', this._onContinue.bind(this), true);
      }
      
      this.fields = this._getFields();
  }

  _getFields(){
      let fields = [];

      const fieldNodes = document.querySelectorAll(this.selectors.inputs);
      const fieldFactory = new FieldFactory();
      fieldNodes.forEach(el => {
          try{
              let field = fieldFactory.createFieldByElement(el);
              if (field != null) fields[el.id] = field;
          }catch(error){
              console.error(error);
          }
      });

      return fields;
  }

  _getLastStep(){
      let lastStep = sessionStorage.getItem('step');

      if(lastStep == null && document.referrer && document.referrer.length > 2) {
          let url = new URL(document.referrer);
          lastStep = url.pathname;
      }

      return lastStep;
  }

  _getCurrentStep(){
      let step = Shopify.Checkout.step;
      if(Shopify.Checkout.page == 'stock_problems') { step = this.Steps.STOCK_PROBLEMS; }

      if(typeof Shopify.Checkout.OrderStatus != 'undefined'){
          if(Shopify.Checkout.page == 'thank_you') step = this.Steps.THANKYOU;
          else step = this.Steps.ORDERSTATUS;
      }

      sessionStorage.setItem('step', step);
      return step;
  }

  _triggerEvent(name, details = {}){
      let event = new CustomEvent(`checkout:${name}`, { detail: details });
      document.dispatchEvent(event);
  }

  _getSelectionMethods(type){
      let methods = document.querySelectorAll(this.selectors.selectionMethods.replace('{TYPE}',type));
      let methodsList = [];

      
      methods.forEach((method) => {
          try{
              if(type == 'shipping') {
                  methodsList.push(new ShippingMethod(method));
              } else if(type == 'payment') {
                  methodsList.push(new PaymentMethod(method));
              }
          }catch(ex){
              if (!(ex instanceof NotValidFieldException)) {
                  throw ex;
              }
          }
      });

      return methodsList;
  }

  _getStockProblemList(){
      let list = document.querySelectorAll(this.selectors.stockProblem.list);
      let stockProblemList = [];

      for (let item of list) {
          let name = item.querySelector(this.selectors.stockProblem.name).innerText;
          let variant = item.querySelector(this.selectors.stockProblem.description).innerText;
          stockProblemList.push({
              name: name,
              variant: variant,
          });
      }

      return stockProblemList;
  }

  _onContinue(event){
      this._triggerEvent('continue', { innerEvent: event });
  }

  _onLoad(event){
      try{
          this._triggerEvent('load');

          switch (this.currentStep) {
              case this.Steps.INFORMATION:
                  this._triggerEvent('load:information');
                  break;
              case this.Steps.SHIPPING: {
                  let shippingMethods = this._getSelectionMethods('shipping');
                  this._triggerEvent('load:shipping', { shippingMethods });
                  break;
              }
              case this.Steps.PAYMENT: {
                  let paymentMethods = this._getSelectionMethods('payment');
                  this._triggerEvent('load:payment', { paymentMethods });
                  break;
              }
              case this.Steps.PROCESSING:
                  this._triggerEvent('load:processing');
                  break;
              case this.Steps.THANKYOU:
                  this._triggerEvent('load:thankyou');
                  break;
              case this.Steps.ORDERSTATUS:
                  this._triggerEvent('load:orderstatus');
                  break;
              case this.Steps.STOCK_PROBLEMS: {
                  var stockProblemList = this._getStockProblemList();
                  this._triggerEvent('load:stockproblems', { stockProblemList });
                  break;
              }
              default:
                  break;
          }
      }catch(ex){
          this._triggerEvent('error', {
              step: this.currentStep,
              event: event,
              error: ex
          });
      }
  }

  _fieldCreated(event){        
      let field = event.detail;
      let input = field.querySelector(this.selectors.fields);

      if(input!=null)
      {
          let hasInputAlready = Object.prototype.hasOwnProperty.call(this.fields, input.id);

          if(this.fields && !hasInputAlready){
              this.fields[input.id] = field;
          }
      }
  }

  _fieldRemoved(event){
      let field = event.detail;
      let input = field.querySelector(this.selectors.fields);
      let hasInputAlready = Object.prototype.hasOwnProperty.call(this.fields, input.id);

      if(this.fields && hasInputAlready){
          delete this.fields[input.id];
      }        
  }

  /**
   * Add an event listener for a specific `event`
   * @param {string} event Event name to listen
   * @param {string} callback Callback function to call when event triggers
   */
  on(event, callback){
      document.addEventListener(`checkout:${event}`, callback, false);
  }
}

class ReferenceNotDefinedException extends Error {
  constructor(value) {
      let message = `ReferenceError: ${value} is not defined.`;
      super(message);

      this.name = 'ReferenceNotDefinedException';
  }
}

class RadioSelectorField extends BaseInputComponent
{
  /**
   * Creates a RadioSelectorField component
   * @param {string} args.id Html element ID
   * @param {string} args.name Field name
   * @param {string} args.value Radio selector value
   * @param {string?} args.label Plain text label
   * @param {string?} args.label Plain text label
   * @param {string?} args.innerHTML HTML label. (Only if no label is specified)
   * @returns {RadioSelectorField}
   * @throws {ReferenceNotDefinedException} For any missing mandatory parameter
   */
  constructor(args){
      super(args);

      let selectors = {
          input: 'input',
      };

      let classes = {
          wrapper: ['radio-wrapper'],
          input: ['radio__input'],
          radioInput: ['input-radio'],
          radioLabel: ['radio__label']
      };
      
      if(args.name == null) throw new ReferenceNotDefinedException('args.name');
      if(args.value == null) throw new ReferenceNotDefinedException('args.value');
      if(args.id == null) throw new ReferenceNotDefinedException('args.id');
      if(args.label == null && args.innerHTML == null) throw new ReferenceNotDefinedException('args.label || args.innerHTML');

      let radioId = args.id;
      let value = args.value;
      let fieldName = `checkout[attributes][${args.name}]`;
      let fieldId = `checkout_attributes_${args.name}`;

      this.classList.add(classes.wrapper);

      Object.setPrototypeOf(this, RadioSelectorField.prototype);

      let field = Object.assign(this, {
          selectors,
          classes,
          fieldName,
          fieldId,
          value,
          radioId,
      });

      if (typeof args == 'object'){
          field.addField(args);
      }

      return field;
  }

  addField(args){
      let inputDiv = this._createInput(args.id);
      let labelDiv = this._createLabel(args);
  
      this.appendChild(inputDiv);
      this.appendChild(labelDiv);
  }

  _createInput(id)
  {
      let inputDiv = document.createElement('div');
      inputDiv.classList.add(...this.classes.input);

      let input = document.createElement('input');
      input.classList.add(...this.classes.radioInput);
      input.type = 'radio';
      input.value = this.value;
      input.name = this.fieldName;
      input.id = id;
      input.addEventListener("input", this.changed.bind(this));

      inputDiv.appendChild(input);
      return inputDiv;
  }

  _createLabel(args)
  {
      const {label, id, innerHTML} = args;

      let labelDiv = document.createElement('label');
      labelDiv.classList.add(...this.classes.radioLabel);
      labelDiv.htmlFor = id;

      let span = document.createElement('span');
      span.textContent = label;
      if(innerHTML != null) span.innerHTML = innerHTML;

      labelDiv.appendChild(span);
      return labelDiv;
  }

  get checked(){
      return this.querySelector(this.selectors.input).checked;
  }

  set checked(isChecked = true){
      this.querySelector(this.selectors.input).checked = isChecked;
      this.changed(new InputEvent('checked:changed'));
  }
}

class RadioContentBoxComponent extends BaseInputComponent{
  constructor(args){
      super();

      let selectors = {
          checked: '[type=radio]:checked',
          radioType: '[type=radio]',
          allOptions: '.content-box__row'
      };

      let classes = {
          box: ['content-box'],
          row: ['content-box__row'],
      };

      let optionCount = 0;
      let options = [];
      let fieldName = `checkout[attributes][${args.name}]`;
      let fieldId = `checkout_attributes_${args.name}`;
      let name = args.name;

      this.classList.add(classes.box);

      Object.setPrototypeOf(this, RadioContentBoxComponent.prototype);

      return Object.assign(this, {
          selectors,
          classes,
          fieldName,
          fieldId,
          name,
          optionCount,
          options,
      });
  }

  addOption(args){
      if(args.label == null && args.innerHTML == null) throw new ReferenceNotDefinedException('args.label || args.innerHTML');

      let row = document.createElement('row');
      row.classList.add(...this.classes.row);

      args.name = this.name;
      args.id = `${this.fieldId}_${++this.optionCount}`;

      let option = new RadioSelectorField(args);
      option.on('changed', this.changed.bind(this));
      this.options.push(option);
      row.appendChild(option);
      this.appendChild(row);
      
      if(this.optionCount == 1)
      {
          this.firstChild.querySelector(this.selectors.radioType).checked = true;
          option.changed.bind(this)(new InputEvent('FirstOptionSelected'));
      }
  }

  removeAllOptions(){
      let options = this.querySelectorAll(this.selectors.allOptions);
      options.forEach((element) => {
          element.remove();
      });
      this.options = [];
      this.optionCount = 0;
  }

  remove(){
      let event = new CustomEvent(`checkout:${this.componentType}:removed`, { detail: this });
      document.dispatchEvent(event);
      super.remove();
  }

  get value(){
      let input = this.querySelector(this.selectors.checked);
      return input ? input.value : null;
  }
}

class SectionComponent extends BaseComponent{
  /**
   * Creates a new Section component if passed {title} and {name}.
   * Creates a Section component from an existing Section if passed a CSS selector as {selector} param.
   * @public
   * @param {{title: string, name: string, selector: string }} args 
   * @returns SectionComponent
   */
  constructor(args = null)
  {
      super(args);
      const {title, name, selector } = args;

      let selectors = {
          contentDivs: '.section__content',
      };

      let classes = {
          section: ['section', `section--${name}`],
          header: ['section__header'],
          content: ['section__content'],
          title: ['section__title'],
      };

      let isVisible = true;
      let contentDivs = [];

      if(selector!=null)
      { 
          let section = document.querySelector(selector);
          if(section!=null)
          {
              let contentDiv = section.querySelector(selectors.contentDivs);
              contentDivs.push(contentDiv);

              Object.setPrototypeOf(section, SectionComponent.prototype);

              return Object.assign(section, {
                  selectors,
                  classes,
                  isVisible,
                  contentDivs,
              });
          }
      }

      this.classList.add(...classes.section);
      let headerDiv = document.createElement('div');
      headerDiv.classList.add(...classes.header);

      let h2 = document.createElement('h2');
      h2.classList.add(...classes.title);
      h2.textContent = title;

      headerDiv.appendChild(h2);

      let contentDiv = document.createElement('div');
      contentDiv.classList.add(...classes.content);
      contentDivs.push(contentDiv);

      this.appendChild(headerDiv);
      this.appendChild(contentDiv);

      Object.setPrototypeOf(this, SectionComponent.prototype);

      return Object.assign(this, {
          selectors,
          classes,
          isVisible,
          contentDivs,
      });
  }

  /**
   * Add a component to a content DIV inside the section
   * @param {BaseComponent} component Component to add
   * @param {number} sectionContentId If section has multiple content DIVs, the index of the content DIV where you want to add the component.
   */
  addContent(component, sectionContentId = 0)
  {
      if(!component || !(component instanceof BaseComponent)) throw TypeError('Object trying to add is not a component.');
      this.contentDivs[sectionContentId].appendChild(component);
  }

  /**
   * Add a new content DIV to the section
   * @returns {number} The content DIV id
   */
  addSectionContentDiv()
  {
      let contentDiv = document.createElement('div');
      contentDiv.classList.add(...this.classes.content);
      this.contentDivs.push(contentDiv);
      this.appendChild(contentDiv);
      return this.contentDivs.length - 1;
  }

  /**
   * Hide the section
   */
  hide()
  {
      this.classList.add('hidden-if-js');
      this.isVisible = !this.isVisible;
  }

  /**
   * Show the section
   */
  show()
  {
      this.classList.remove('hidden-if-js');
      this.isVisible = !this.isVisible;
  }

  /**
   * Toggle between hide and show
   */
  toggle()
  {
      if(this.isVisible) this.hide();
      else this.show();
  }

}

let $checkout = new Checkout();

export { $checkout, BaseComponent, BaseInputComponent, CheckboxField, DropdownField, PaymentMethod, RadioContentBoxComponent, SectionComponent, ShippingMethod, TextField };
//# sourceMappingURL=checkout.js.map