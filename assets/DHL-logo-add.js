function waitForElem(
  waitFor,
  callback,
  minElements = 1,
  isVariable = false,
  timer = 10000,
  frequency = 25
) {
  let elements = isVariable
    ? window[waitFor]
    : document.querySelectorAll(waitFor);
  if (timer <= 0) return;
  (!isVariable && elements.length >= minElements) ||
  (isVariable && typeof window[waitFor] !== "undefined")
    ? callback(elements)
    : setTimeout(
        () =>
          waitForElem(
            waitFor,
            callback,
            minElements,
            isVariable,
            timer - frequency
          ),
        frequency
      );
}

const createElement = () => {
  const html = `<span class='dhl-logo-wrapper'>
                  <img width="73px" height="20px" src="https://cdn.shopify.com/s/files/1/0063/0721/7473/files/dhl-gogreen-optimized.png">
                </span>`;
  return html;
};

const insertElement = (target, position, element) => {
  typeof element == "string"
    ? target.insertAdjacentHTML(position, element)
    : target.insertAdjacentElement(position, element);
};

waitForElem(
  "html[data-current-step='shipping_method'] [data-shipping-method-label-title]",
  ([element]) => {
    document.body.classList.add("DHL-logo");
    element.classList.add("DHL-logo");
    insertElement(element, "beforeend", createElement());
  }
);
