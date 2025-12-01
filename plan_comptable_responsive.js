// Responsive Modal for Plan Comptable
(function () {
    'use strict';

    // Create modal HTML
    const modalHTML = `
        <div id="account-modal" class="account-modal-overlay">
            <div class="account-modal-content">
                <div class="account-modal-header">
                    <h2 id="modal-title">Détails du Compte</h2>
                    <button class="account-modal-close" onclick="closeAccountModal()">&times;</button>
                </div>
                <div class="account-modal-body">
                    <div id="modal-account-details">
                        <div class="modal-numero-titre">
                            <p class="modal-numero" id="modal-detail-numero"></p>
                            <p class="modal-titre" id="modal-detail-titre"></p>
                        </div>
                        
                        <div class="modal-section">
                            <h3 class="modal-section-title">Explication en Français</h3>
                            <p class="modal-explication" id="modal-detail-explication"></p>
                        </div>
                        
                        <div class="modal-section">
                            <h3 class="modal-section-title">الشرح بالدارجة المغربية</h3>
                            <p class="modal-darija" id="modal-detail-exp-darija"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal CSS
    const style = document.createElement('style');
    style.textContent = `
        .account-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            overflow-y: auto;
            padding: 20px;
        }
        
        .account-modal-overlay.active {
            display: flex;
            align-items: flex-start;
            justify-content: center;
        }
        
        .account-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 90%;
            width: 600px;
            margin: 20px auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: modalSlideUp 0.3s ease-out;
        }
        
        @keyframes modalSlideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .account-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .account-modal-header h2 {
            margin: 0;
            color: #4f46e5;
            font-size: 1.5rem;
        }
        
        .account-modal-close {
            background: none;
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .account-modal-close:hover {
            background-color: #f3f4f6;
        }
        
        .account-modal-body {
            padding: 20px;
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .modal-numero-titre {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .modal-numero {
            font-size: 2rem;
            font-weight: 800;
            color: #312e81;
            margin: 0 0 8px 0;
        }
        
        .modal-titre {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin: 0;
        }
        
        .modal-section {
            margin-bottom: 24px;
        }
        
        .modal-section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 12px 0;
            padding-left: 12px;
            border-left: 4px solid #4f46e5;
        }
        
        .modal-explication {
            color: #4b5563;
            line-height: 1.6;
            white-space: pre-wrap;
            margin: 0;
        }
        
        .modal-darija {
            font-family: 'Noto Sans Arabic', 'Inter', sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8;
            color: #1f2937;
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin: 0;
        }
        
        /* Hide right panel on mobile */
        @media (max-width: 768px) {
            .w-full.md\\:w-2\\/3 {
                display: none !important;
            }
            
            .w-full.md\\:w-1\\/3 {
                width: 100% !important;
                margin-right: 0 !important;
            }
            
            main.flex {
                flex-direction: column !important;
            }
            
            .account-modal-content {
                max-width: 95%;
                margin: 10px;
            }
            
            .account-modal-body {
                max-height: 65vh;
            }
            
            .modal-numero {
                font-size: 1.5rem;
            }
            
            .modal-titre {
                font-size: 1.1rem;
            }
        }
    `;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Add styles
        document.head.appendChild(style);

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Store original display function
        const originalDisplayFunction = window.displayAccountDetails;

        // Override display function to use modal on mobile
        window.displayAccountDetails = function (compte, event) {
            if (window.innerWidth <= 768) {
                // Mobile: show modal
                showAccountModal(compte);
            } else {
                // Desktop: use original function
                if (originalDisplayFunction) {
                    originalDisplayFunction(compte, event);
                }
            }
        };

        // Close modal when clicking outside
        document.getElementById('account-modal').addEventListener('click', function (e) {
            if (e.target === this) {
                closeAccountModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeAccountModal();
            }
        });
    }

    // Show modal with account details
    function showAccountModal(compte) {
        const modal = document.getElementById('account-modal');

        // Update modal content
        document.getElementById('modal-detail-numero').textContent = compte.numero;
        document.getElementById('modal-detail-titre').textContent = compte.titre;
        document.getElementById('modal-detail-explication').textContent =
            compte.explication || "Pas d'explication disponible en Français.";

        const darijaElement = document.getElementById('modal-detail-exp-darija');
        if (compte.exp_darija) {
            darijaElement.innerHTML = compte.exp_darija.replace(/\n/g, '<br>');
        } else {
            darijaElement.textContent = "ماكاينش شي شرح بالدارجة هنا.";
        }

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    window.closeAccountModal = function () {
        const modal = document.getElementById('account-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

})();
