class InteractiveProof {
    constructor(containerId, proofData) {
        this.container = document.getElementById(containerId);
        this.data = proofData;
        this.currentStep = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <h3 class="text-xl font-bold flex items-center gap-2">
                        <span>🕵️</span> ${this.data.title}
                    </h3>
                    <p class="mt-2 text-blue-100 italic">${this.data.intro}</p>
                </div>
                <div id="${this.container.id}-content" class="p-6 space-y-6">
                    <!-- Steps will be injected here -->
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div class="text-sm text-gray-500" id="${this.container.id}-progress">
                        Step 1 of ${this.data.steps.length}
                    </div>
                    <button id="${this.container.id}-next-btn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Start Proof
                    </button>
                </div>
            </div>
        `;

        this.contentArea = document.getElementById(`${this.container.id}-content`);
        this.nextBtn = document.getElementById(`${this.container.id}-next-btn`);
        this.progress = document.getElementById(`${this.container.id}-progress`);

        this.nextBtn.addEventListener('click', () => this.nextStep());
        
        // Initial render
        this.renderStep(0);
    }

    nextStep() {
        if (this.currentStep < this.data.steps.length - 1) {
            this.currentStep++;
            this.renderStep(this.currentStep);
        } else {
            // Proof complete
            this.contentArea.innerHTML += `
                <div class="bg-green-100 dark:bg-green-900/30 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center animate-fade-in">
                    <div class="text-4xl mb-2">🎉</div>
                    <h4 class="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Q.E.D.</h4>
                    <p class="text-green-700 dark:text-green-400">You've successfully completed the proof!</p>
                </div>
            `;
            this.nextBtn.style.display = 'none';
            this.progress.textContent = "Proof Complete";
            this.scrollToBottom();
        }
    }

    renderStep(index) {
        const step = this.data.steps[index];
        const stepId = `${this.container.id}-step-${index}`;
        
        // Update button state
        if (index === 0) {
            this.nextBtn.textContent = "Next Step";
        }
        
        // Logic for different step types
        let html = '';
        
        if (step.type === 'text' || step.type === 'step') {
            html = `
                <div id="${stepId}" class="proof-step opacity-0 transform translate-y-4 transition duration-500">
                    <div class="flex gap-4">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                            ${index + 1}
                        </div>
                        <div class="flex-grow">
                            <p class="text-gray-800 dark:text-gray-200 text-lg">${step.text || step.content}</p>
                            ${step.math ? `<div class="my-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center font-mono text-sm overflow-x-auto">$$${step.math}$$</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            this.contentArea.insertAdjacentHTML('beforeend', html);
            
            // Animate in
            setTimeout(() => {
                const el = document.getElementById(stepId);
                el.classList.remove('opacity-0', 'translate-y-4');
            }, 50);

        } else if (step.type === 'question') {
            this.nextBtn.disabled = true; // Disable next until answered
            
            html = `
                <div id="${stepId}" class="proof-step opacity-0 transform translate-y-4 transition duration-500">
                    <div class="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div class="flex items-start gap-3 mb-4">
                            <span class="text-2xl">🤔</span>
                            <h4 class="text-lg font-bold text-orange-800 dark:text-orange-300">${step.text}</h4>
                        </div>
                        <div class="space-y-3">
                            ${step.options.map((opt, i) => `
                                <button class="w-full text-left p-4 rounded-lg border border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition group option-btn" data-index="${i}">
                                    <div class="flex items-center gap-3">
                                        <div class="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-orange-500 flex items-center justify-center">
                                            <div class="w-3 h-3 rounded-full bg-orange-500 opacity-0 transition indicator"></div>
                                        </div>
                                        <span class="text-gray-700 dark:text-gray-300">${opt.text}</span>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                        <div id="${stepId}-feedback" class="mt-4 hidden p-4 rounded-lg text-sm"></div>
                    </div>
                </div>
            `;
            this.contentArea.insertAdjacentHTML('beforeend', html);
            
            // Animate in
            setTimeout(() => {
                const el = document.getElementById(stepId);
                el.classList.remove('opacity-0', 'translate-y-4');
            }, 50);

            // Add event listeners
            const options = document.querySelectorAll(`#${stepId} .option-btn`);
            const feedbackEl = document.getElementById(`${stepId}-feedback`);
            
            options.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.dataset.index);
                    const isCorrect = step.options[idx].correct;
                    const feedback = step.options[idx].feedback;
                    
                    // Reset all
                    options.forEach(b => {
                        b.classList.remove('ring-2', 'ring-green-500', 'ring-red-500');
                        b.querySelector('.indicator').classList.remove('opacity-100');
                    });

                    // Highlight selected
                    btn.classList.add('ring-2', isCorrect ? 'ring-green-500' : 'ring-red-500');
                    btn.querySelector('.indicator').classList.add('opacity-100');

                    // Show feedback
                    feedbackEl.className = `mt-4 p-4 rounded-lg text-sm ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`;
                    feedbackEl.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Not quite.'}</strong> ${feedback}`;
                    feedbackEl.classList.remove('hidden');

                    if (isCorrect) {
                        this.nextBtn.disabled = false;
                    }
                });
            });

        } else if (step.type === 'spot-error') {
            this.nextBtn.disabled = true;
            
            html = `
                <div id="${stepId}" class="proof-step opacity-0 transform translate-y-4 transition duration-500">
                    <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                        <div class="flex items-start gap-3 mb-4">
                            <span class="text-2xl">🧐</span>
                            <div>
                                <h4 class="text-lg font-bold text-red-800 dark:text-red-300">${step.text}</h4>
                                <p class="text-sm text-red-600 dark:text-red-400">Click on the part of the proof that contains the error.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-serif text-lg leading-relaxed cursor-pointer relative group" id="${stepId}-proposal">
                            ${this.highlightSentences(step.proposal)}
                        </div>
                        
                        <div id="${stepId}-feedback" class="mt-4 hidden p-4 rounded-lg text-sm"></div>
                    </div>
                </div>
            `;
            this.contentArea.insertAdjacentHTML('beforeend', html);
            
            // Animate in
            setTimeout(() => {
                const el = document.getElementById(stepId);
                el.classList.remove('opacity-0', 'translate-y-4');
            }, 50);

            // Add interaction
            const sentences = document.querySelectorAll(`#${stepId}-proposal .proof-sentence`);
            const feedbackEl = document.getElementById(`${stepId}-feedback`);
            
            sentences.forEach((sent, idx) => {
                sent.addEventListener('click', () => {
                    const isCorrect = (idx === step.error_index);
                    
                    // Reset
                    sentences.forEach(s => s.classList.remove('bg-red-200', 'dark:bg-red-900', 'bg-green-200', 'dark:bg-green-900'));
                    
                    if (isCorrect) {
                        sent.classList.add('bg-green-200', 'dark:bg-green-900');
                        feedbackEl.className = "mt-4 p-4 rounded-lg text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                        feedbackEl.innerHTML = `<strong>Good catch!</strong> ${step.correction}`;
                        this.nextBtn.disabled = false;
                    } else {
                        sent.classList.add('bg-red-200', 'dark:bg-red-900');
                        feedbackEl.className = "mt-4 p-4 rounded-lg text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                        feedbackEl.innerHTML = `<strong>That part seems okay.</strong> Look closer!`;
                    }
                    feedbackEl.classList.remove('hidden');
                });
            });
        }

        // Update progress
        this.progress.textContent = `Step ${index + 1} of ${this.data.steps.length}`;
        
        // Re-render MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById(stepId)]);
        }
        
        this.scrollToBottom();
    }

    highlightSentences(text) {
        // Simple sentence splitter, can be improved
        return text.split('. ').map((s, i) => 
            `<span class="proof-sentence hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-1 rounded transition duration-200" data-index="${i}">${s}${i < text.split('. ').length - 1 ? '.' : ''}</span>`
        ).join(' ');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.contentArea.scrollTop = this.contentArea.scrollHeight;
        }, 100);
    }
}
