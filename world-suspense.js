// suspense-element.js
class SuspenseElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          .loading {
            display: block;
          }
          .loaded .loading {
            display: none;
          }
          ::slotted(*) {
            display: none;
          }
          .loaded ::slotted(*) {
            display: block;
          }
          .progressive ::slotted(*) {
            display: block;
          }
        </style>
        <div class="loading">${this.getAttribute('waitingtext') || 'Loading...'}</div>
        <slot></slot>
      `;
    }

    connectedCallback() {
      const slot = this.shadowRoot.querySelector('slot');
      const elements = slot.assignedElements();
      const delay = parseInt(this.getAttribute('delay') || '0', 10);

      if (elements.length === 0) {
        this.setLoading(true);
        return;
      }

      this.setLoading(true);

      this.delay(delay).then(() => {
          elements.forEach(el => this.waitForElement(el).then(() => {
            el.style.display = 'block';
          }));
          this.setLoading(false);
        });
    }

    waitForElement(element) {
      return new Promise(resolve => {
        if (element.tagName === 'IMG') {
          if (element.complete) {
            resolve();
          } else {
            element.addEventListener('load', resolve);
            element.addEventListener('error', resolve); // handle error case
          }
        } else {
          resolve();
        }
      });
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    setLoading(isLoading) {
      this.shadowRoot.querySelector('.loading').style.display = isLoading ? 'block' : 'none';
      this.classList.toggle('loaded', !isLoading);
    }
  }

  customElements.define('world-suspense', SuspenseElement);
