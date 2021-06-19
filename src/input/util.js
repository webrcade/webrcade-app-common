const toggleTabIndex = (parent, focusable) => {
  const FOCUSABLE_ELEMENTS = [
    'a[href]', 'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]',
    /*'[tabindex]:not([tabindex^="-"])'*/];

  const getFocusableElements = el => {
    return Array.prototype.slice.call(
      el.querySelectorAll(FOCUSABLE_ELEMENTS.join(','))
    )
  }

  const makeTabbable = el => {
    if (el.hasAttribute('data-tabindex')) {
      const index = el.getAttribute('data-tabindex');
      if (index == -2) {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', index);
      }
    }
  }

  const makeUntabbable = el => {
    el.setAttribute('data-tabindex',
      el.hasAttribute('tabindex') ? el.getAttribute('tabindex') : -2);
    el.setAttribute('tabindex', -1);
  }

  const els = getFocusableElements(parent)
  focusable ? els.forEach(makeTabbable) : els.forEach(makeUntabbable);
};

export { toggleTabIndex };




