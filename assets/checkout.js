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

  var checkoutTotalLines = document.querySelector('#order-summary');
  var changesObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Do some stuff
        console.log('mutate');
      }
    });
  });
  var changesObserver = { attributes: true, childList: true, characterData: true }

  if (checkoutTotalLines) {
    console.log(checkoutTotalLines);
    console.log('checkoutTotalLines');
    changesObserver.observe(checkoutTotalLines, changesObserver);
  }

  const checkoutSupportBoxEl = document.querySelector('.checkoutSupportBoxEl');
  const checkoutSupportBoxMain = document.querySelector('.checkoutSupportBoxMain');
  if (checkoutSupportBoxEl && checkoutSupportBoxMain) {
    checkoutSupportBoxMain.appendChild(checkoutSupportBoxEl.cloneNode(true));
  }

  const discountSuccessMessageRoot = document.querySelector('.discountSuccessMessageRoot');
  const discountSuccessMessage1 = document.querySelector('.checkout-breadcrumbs');
  const discountSuccessMessage2 = document.querySelector('.order-summary__section--discount');
  const orderTotalWrapper = document.querySelector('.order-summary__section--discount');
  if (discountSuccessMessageRoot) {

    if (discountSuccessMessage1) {
      discountSuccessMessage1.appendChild(discountSuccessMessageRoot.cloneNode(true));
    }
    if (discountSuccessMessage2) {
      discountSuccessMessage2.appendChild(discountSuccessMessageRoot.cloneNode(true));
    }
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