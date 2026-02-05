/**
 * Clockra Booking Widget Loader
 * 
 * Usage:
 * <script src="https://yourdomain.com/js/widget.js" data-slug="provider-slug"></script>
 * 
 * Optional attributes:
 * - data-color: Primary color (hex code, e.g., #3B82F6)
 * - data-size: Widget size (small, medium, large)
 * - data-width: Container width (e.g., 100%, 600px)
 * - data-height: Container height (e.g., auto, 800px)
 */

(function() {
    'use strict';

    // Find all script tags with widget.js
    const scripts = document.querySelectorAll('script[src*="widget.js"]');
    
    scripts.forEach(function(script) {
        const slug = script.getAttribute('data-slug');
        if (!slug) {
            console.error('Clockra Widget: data-slug attribute is required');
            return;
        }

        // Get configuration from data attributes
        const color = script.getAttribute('data-color') || '#3B82F6';
        const size = script.getAttribute('data-size') || 'medium';
        const width = script.getAttribute('data-width') || '100%';
        const height = script.getAttribute('data-height') || 'auto';

        // Get the script's source URL to determine the base URL
        const scriptSrc = script.src;
        const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/js/widget.js'));

        // Create container div
        const container = document.createElement('div');
        container.id = 'clockra-widget-' + slug;
        container.style.width = width;
        container.style.height = height;
        container.style.minHeight = '600px';
        container.style.border = 'none';
        container.style.overflow = 'hidden';

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = baseUrl + '/widget/' + slug + '?color=' + encodeURIComponent(color) + '&size=' + encodeURIComponent(size);
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');

        // Handle iframe resize
        iframe.onload = function() {
            try {
                // Try to get iframe content height and adjust
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc.body) {
                    iframe.style.height = iframeDoc.body.scrollHeight + 'px';
                }
            } catch (e) {
                // Cross-origin restrictions - use postMessage instead
                // This will be handled by the widget page
            }
        };

        // Listen for resize messages from iframe
        window.addEventListener('message', function(event) {
            // Verify origin (you should set this to your domain)
            // if (event.origin !== baseUrl) return;
            
            if (event.data && event.data.type === 'clockra-widget-resize') {
                iframe.style.height = event.data.height + 'px';
            }
        });

        container.appendChild(iframe);

        // Insert after the script tag
        script.parentNode.insertBefore(container, script.nextSibling);
    });
})();
