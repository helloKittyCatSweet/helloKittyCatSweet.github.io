// Load Mermaid diagram library
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMermaid);
} else {
  loadMermaid();
}

function loadMermaid() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
  script.onload = () => {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      mermaid.contentLoaded();
    }
  };
  document.body.appendChild(script);
}
