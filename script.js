/* =============================================
   LEARN PYTORCH — Interactive Functionality
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // === State ===
    const TOTAL_CHAPTERS = 12;
    const completedChapters = new Set(
        JSON.parse(localStorage.getItem('pytorch_completed') || '[]')
    );

    // === DOM Elements ===
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const backToTop = document.getElementById('backToTop');
    const progressText = document.getElementById('progressText');

    // === Navigation: Scroll Effects ===
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        updateActiveNavLink();

        lastScroll = scrollY;
    });

    // === Active Nav Link ===
    function updateActiveNavLink() {
        const sections = ['roadmap', 'beginner', 'intermediate', 'advanced', 'tasks', 'simulator', 'blueprint', 'protricks', 'challenges', 'debugging', 'projects', 'codestudio', 'resources'];
        const links = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150) {
                    current = id;
                }
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // === Hamburger Menu ===
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // === Back to Top ===
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === Chapter Accordion ===
    document.querySelectorAll('.chapter-header').forEach(header => {
        header.addEventListener('click', () => {
            const chapter = header.closest('.chapter');
            const isOpen = chapter.classList.contains('open');

            // Close all chapters in the same section
            // (optional: remove this block to allow multiple open)
            // const section = chapter.closest('.level-section');
            // section.querySelectorAll('.chapter.open').forEach(ch => {
            //     if (ch !== chapter) ch.classList.remove('open');
            // });

            chapter.classList.toggle('open');
        });
    });

    // === Copy to Clipboard ===
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = btn.getAttribute('data-code');
            const text = code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

            navigator.clipboard.writeText(text).then(() => {
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });

    // === Chapter Completion ===
    document.querySelectorAll('.complete-btn').forEach(btn => {
        const chapterId = btn.getAttribute('data-chapter');

        // Restore state
        if (completedChapters.has(chapterId)) {
            markCompleted(btn, chapterId);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (completedChapters.has(chapterId)) {
                completedChapters.delete(chapterId);
                unmarkCompleted(btn, chapterId);
            } else {
                completedChapters.add(chapterId);
                markCompleted(btn, chapterId);
                showConfetti(btn);
            }

            // Persist
            localStorage.setItem(
                'pytorch_completed',
                JSON.stringify([...completedChapters])
            );
            updateProgress();
        });
    });

    function markCompleted(btn, chapterId) {
        btn.classList.add('completed');
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Completed ✓
        `;
        const chapter = document.getElementById(chapterId);
        if (chapter) chapter.classList.add('completed');
    }

    function unmarkCompleted(btn, chapterId) {
        btn.classList.remove('completed');
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Mark as Complete
        `;
        const chapter = document.getElementById(chapterId);
        if (chapter) chapter.classList.remove('completed');
    }

    // === Progress Tracking ===
    function updateProgress() {
        const percent = Math.round((completedChapters.size / TOTAL_CHAPTERS) * 100);
        progressText.textContent = `${percent}%`;

        // Update SVG circle
        const circle = document.querySelector('.progress-circle');
        if (circle) {
            const radius = 8;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percent / 100) * circumference;
            circle.setAttribute('d', describeArc(10, 10, radius, 0, (percent / 100) * 360));
        }
    }

    function describeArc(x, y, radius, startAngle, endAngle) {
        if (endAngle >= 360) endAngle = 359.99;
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');
    }

    function polarToCartesian(cx, cy, radius, angleInDegrees) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(angleInRadians),
            y: cy + radius * Math.sin(angleInRadians),
        };
    }

    // === Mini Confetti Effect ===
    function showConfetti(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#4ade80', '#60a5fa', '#c084fc', '#fbbf24', '#ee4c2c'];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top}px;
                pointer-events: none;
                z-index: 10000;
            `;
            document.body.appendChild(particle);

            const angle = (Math.random() * Math.PI * 2);
            const velocity = Math.random() * 100 + 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 80;

            let x = 0, y = 0, opacity = 1;
            const startTime = performance.now();

            function animate(time) {
                const elapsed = (time - startTime) / 1000;
                x = vx * elapsed;
                y = vy * elapsed + 0.5 * 400 * elapsed * elapsed;
                opacity = Math.max(0, 1 - elapsed * 1.5);
                
                particle.style.transform = `translate(${x}px, ${y}px) rotate(${elapsed * 360}deg)`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            }

            requestAnimationFrame(animate);
        }
    }

    // === Scroll Reveal Animation ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.chapter, .roadmap-item, .cheat-card, .resource-card').forEach(el => {
        observer.observe(el);
    });

    // === Smooth Scroll for Anchor Links ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // === Keyboard Navigation ===
    document.addEventListener('keydown', (e) => {
        // Escape closes mobile menu
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });

    // === TRAINING LOOP SIMULATOR ENGINE ===
    let currentSimStep = 1;
    let simInterval = null;

    const simStepsData = {
        1: {
            title: '🔍 Step 1: Device Transfer (CPU ➔ GPU)',
            desc: 'DataLoader loads samples into CPU RAM. The .to(device) call sends tensors over PCIe bus to GPU VRAM where CUDA tensor cores can perform massive parallel matrix calculations.',
            inputs: '[32, 3, 32, 32] (CUDA:0)',
            weights: 'W: [64, 3, 3, 3] (CUDA:0)',
            outputs: 'None (Not computed)',
            loss: 'None (Not computed)',
            graph: 'Idle — Awaiting forward pass execution',
            grads: 'w.grad: None (or holds old gradients from previous step)'
        },
        2: {
            title: '⚡ Step 2: Forward Pass (Building Computational Graph)',
            desc: 'Inputs flow through convolution and linear layers. As operations execute, PyTorch Autograd dynamically constructs a Directed Acyclic Graph (DAG) of tensor transformations in memory.',
            inputs: '[32, 3, 32, 32] (CUDA:0)',
            weights: 'W: [64, 3, 3, 3] (CUDA:0)',
            outputs: '[32, 10] (Logits, CUDA:0)',
            loss: 'None (Not computed)',
            graph: 'Active: Dynamic DAG created with grad_fn=<AddmmBackward0>',
            grads: 'w.grad: Not calculated yet'
        },
        3: {
            title: '📉 Step 3: Compute Loss Metric (CrossEntropy / MSE)',
            desc: 'The loss function compares model predictions against ground truth target labels, outputting a single scalar tensor measuring error penalty. This scalar is the root of the backprop DAG.',
            inputs: '[32, 3, 32, 32] (CUDA:0)',
            weights: 'W: [64, 3, 3, 3] (CUDA:0)',
            outputs: '[32, 10] (Logits)',
            loss: '0.8421 (grad_fn=<NllLossBackward0>)',
            graph: 'Loss scalar attached as root node of Autograd DAG',
            grads: 'w.grad: Not calculated yet'
        },
        4: {
            title: '🧹 Step 4: Zero Existing Gradients (Prevent Accumulation)',
            desc: 'Crucial! PyTorch accumulates gradients by default. Calling optimizer.zero_grad() clears all param.grad buffers to 0.0 before backprop so new gradients do not sum with previous batches.',
            inputs: '[32, 3, 32, 32] (CUDA:0)',
            weights: 'W: [64, 3, 3, 3] (CUDA:0)',
            outputs: '[32, 10]',
            loss: '0.8421',
            graph: 'DAG intact and ready for backward traversal',
            grads: 'w.grad: Cleared to 0.0 (buffers wiped clean)'
        },
        5: {
            title: '🔄 Step 5: Backpropagation (Autograd Chain Rule)',
            desc: 'PyTorch traverses backwards from the loss scalar through the DAG, applying the Chain Rule of calculus to compute exact partial derivatives dLoss/dWeight for every parameter.',
            inputs: '[32, 3, 32, 32] (CUDA:0)',
            weights: 'W: [64, 3, 3, 3] (CUDA:0)',
            outputs: '[32, 10]',
            loss: '0.8421 (Graph intermediate buffers freed after backward)',
            graph: 'Graph traversed; gradients populated in parameter buffers',
            grads: 'w.grad: [+0.0241, -0.0152, ...] (Computed gradients ready)'
        },
        6: {
            title: '🚀 Step 6: Optimizer Parameter Update',
            desc: 'The optimizer uses computed gradients to nudge weights in the direction of lower loss: w = w - lr * w.grad. Then loss.item() detaches a raw float to prevent VRAM memory leaks.',
            inputs: '[32, 3, 32, 32]',
            weights: 'W: Updated parameters (Weights updated, loss decreases!)',
            outputs: '[32, 10]',
            loss: '0.8421 (Detached via loss.item())',
            graph: 'Cleared; ready for next batch iteration',
            grads: 'w.grad: Stored in memory until next zero_grad()'
        }
    };

    function updateSimulatorUI(step) {
        currentSimStep = step;
        const data = simStepsData[step];
        if (!data) return;

        // Step nodes
        document.querySelectorAll('.step-node').forEach(node => {
            const nodeStep = parseInt(node.getAttribute('data-step'));
            node.classList.remove('active');
            if (nodeStep === step) {
                node.classList.add('active');
            }
        });

        // Highlight code line
        for (let i = 1; i <= 6; i++) {
            const line = document.getElementById(`simLine${i}`);
            if (line) {
                if (i === step) {
                    line.classList.add('highlight');
                } else {
                    line.classList.remove('highlight');
                }
            }
        }

        // Update inspector texts
        const titleEl = document.getElementById('simStepTitle');
        const descEl = document.getElementById('simStepDesc');
        const inputsEl = document.getElementById('memInputs');
        const weightsEl = document.getElementById('memWeights');
        const outputsEl = document.getElementById('memOutputs');
        const lossEl = document.getElementById('memLoss');
        const graphEl = document.getElementById('memGraph');
        const gradsEl = document.getElementById('memGrads');

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (inputsEl) inputsEl.textContent = data.inputs;
        if (weightsEl) weightsEl.textContent = data.weights;
        if (outputsEl) outputsEl.textContent = data.outputs;
        if (lossEl) lossEl.textContent = data.loss;
        if (graphEl) graphEl.textContent = data.graph;
        if (gradsEl) gradsEl.textContent = data.grads;
    }

    const simPrevBtn = document.getElementById('simPrevBtn');
    const simNextBtn = document.getElementById('simNextBtn');
    const simPlayBtn = document.getElementById('simPlayBtn');
    const simResetBtn = document.getElementById('simResetBtn');

    if (simNextBtn) {
        simNextBtn.addEventListener('click', () => {
            let next = currentSimStep + 1;
            if (next > 6) next = 1;
            updateSimulatorUI(next);
        });
    }

    if (simPrevBtn) {
        simPrevBtn.addEventListener('click', () => {
            let prev = currentSimStep - 1;
            if (prev < 1) prev = 6;
            updateSimulatorUI(prev);
        });
    }

    if (simResetBtn) {
        simResetBtn.addEventListener('click', () => {
            if (simInterval) {
                clearInterval(simInterval);
                simInterval = null;
                if (simPlayBtn) simPlayBtn.textContent = '▶ Auto Step';
            }
            updateSimulatorUI(1);
        });
    }

    if (simPlayBtn) {
        simPlayBtn.addEventListener('click', () => {
            if (simInterval) {
                clearInterval(simInterval);
                simInterval = null;
                simPlayBtn.textContent = '▶ Auto Step';
            } else {
                simPlayBtn.textContent = '⏸ Pause';
                simInterval = setInterval(() => {
                    let next = currentSimStep + 1;
                    if (next > 6) next = 1;
                    updateSimulatorUI(next);
                }, 2000);
            }
        });
    }

    document.querySelectorAll('.step-node').forEach(node => {
        node.addEventListener('click', () => {
            const step = parseInt(node.getAttribute('data-step'));
            updateSimulatorUI(step);
        });
    });

    updateSimulatorUI(1);

    // === MASTER TRAINING SCRIPT BLUEPRINT ENGINE ===
    let currentBpStep = 1;
    const blueprintStepsData = {
        1: {
            tag: 'Step 1 of 8',
            title: '🌱 1. Deterministic Seeding & Reproducibility',
            desc: 'PyTorch models rely on pseudo-random numbers for weight initialization, data augmentation, and DataLoader shuffling. Without full deterministic seeding across Python, NumPy, PyTorch CPU, and PyTorch CUDA backend algorithms, two identical training runs will produce diverging losses.',
            warning: '⚠️ If skipped: Different results every run. Impossible to know if an accuracy gain came from your new model architecture or random initialization luck.',
            code: `# Step 1: Seed Everything Recipe
import random
import os
import numpy as np
import torch

def seed_everything(seed=42):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # Enforce deterministic cuDNN convolution primitives
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

seed_everything(42)`
        },
        2: {
            tag: 'Step 2 of 8',
            title: '⚡ 2. Hardware Auto-Detection (CUDA > MPS > CPU)',
            desc: 'A robust training script must run anywhere without manual edits: on an NVIDIA RTX GPU (CUDA), on Apple Silicon M-series (MPS), or fallback safely to CPU. Always print the selected device to confirm GPU allocation.',
            warning: '⚠️ If skipped: Hardcoding .to("cuda") will crash immediately on laptops or cloud instances without NVIDIA drivers.',
            code: `# Step 2: Auto Device Selection
if torch.cuda.is_available():
    device = torch.device('cuda')
elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
    device = torch.device('mps')
else:
    device = torch.device('cpu')

print(f"🚀 Execution hardware: {device}")`
        },
        3: {
            tag: 'Step 3 of 8',
            title: '📦 3. High-Throughput DataLoader Pipeline',
            desc: 'Your GPU can perform trillions of floating-point calculations per second, but it will sit idle if data loading from CPU RAM or NVMe SSD is single-threaded. Use num_workers > 0 and pin_memory=True for direct memory access (DMA) transfers.',
            warning: '⚠️ If skipped: GPU utilization drops to 15-30% while the GPU stalls waiting for the next CPU batch.',
            code: `# Step 3: Fast DataLoader Setup
from torch.utils.data import DataLoader, TensorDataset

# Example dataset
train_data = TensorDataset(torch.randn(1000, 32), torch.randint(0, 2, (1000,)))

train_loader = DataLoader(
    train_data,
    batch_size=64,
    shuffle=True,
    num_workers=2,            # Multi-process preloading
    pin_memory=True,          # Direct DMA transfer to GPU VRAM
    persistent_workers=True   # Avoid worker restart overhead per epoch
)`
        },
        4: {
            tag: 'Step 4 of 8',
            title: '🧠 4. Neural Network Architecture (nn.Module)',
            desc: 'Subclass torch.nn.Module, define trainable layers in __init__, and chain transformations in forward(x). Always print the parameter count and send the model to device before instantiating the optimizer.',
            warning: '⚠️ If skipped: Instantiating optimizer before model.to(device) causes optimizer states to remain in CPU memory while model weights move to GPU!',
            code: `# Step 4: Model Architecture
class MLPClassifier(nn.Module):
    def __init__(self, in_features=32, hidden_dim=64, num_classes=2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x):
        return self.net(x)

# ALWAYS send model to device BEFORE initializing optimizer!
model = MLPClassifier().to(device)`
        },
        5: {
            tag: 'Step 5 of 8',
            title: '🎯 5. Loss Function & Modern Optimizer',
            desc: 'Pair your problem with the correct loss: nn.CrossEntropyLoss for multi-class classification (expects raw logits, not Softmax!), nn.BCEWithLogitsLoss for binary, and nn.MSELoss for regression. Use AdamW with decoupled weight decay.',
            warning: '⚠️ If skipped: Putting nn.Softmax() before nn.CrossEntropyLoss double-softs the probabilities and flattens training gradients.',
            code: `# Step 5: Loss and Optimizer
criterion = nn.CrossEntropyLoss()

# AdamW with decoupled weight decay prevents overfitting
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=1e-3,
    weight_decay=1e-4
)

# Smooth cosine decay down to 1e-6
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)`
        },
        6: {
            tag: 'Step 6 of 8',
            title: '🔄 6. Pro Training Epoch Loop',
            desc: 'Set model.train(). Iterate through batches with non_blocking=True. Run forward pass under torch.amp.autocast, scale loss, backprop, clip gradients to stop exploding numbers, and step optimizer. Detach loss using loss.item() to prevent VRAM leak.',
            warning: '⚠️ If skipped: Forgetting loss.item() stores the full computational graph for all epochs, eventually causing a CUDA out-of-memory crash.',
            code: `# Step 6: Production Training Loop
scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None

def train_epoch(model, loader, optimizer, criterion, device, scaler):
    model.train()
    total_loss = 0.0
    
    for batch_x, batch_y in loader:
        batch_x = batch_x.to(device, non_blocking=True)
        batch_y = batch_y.to(device, non_blocking=True)
        optimizer.zero_grad()
        
        # Mixed Precision Forward
        if scaler:
            with torch.amp.autocast('cuda'):
                preds = model(batch_x)
                loss = criterion(preds, batch_y)
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
        else:
            preds = model(batch_x)
            loss = criterion(preds, batch_y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
        total_loss += loss.item()  # Essential .item()!
    return total_loss / len(loader)`
        },
        7: {
            tag: 'Step 7 of 8',
            title: '🧪 7. Bulletproof Validation Loop',
            desc: 'Always evaluate performance on unseen data. Crucially wrap validation in model.eval() and with torch.no_grad(): to disable Dropout, freeze BatchNorm running statistics, and deactivate Autograd computation graph memory.',
            warning: '⚠️ If skipped: Without model.eval(), Dropout randomly zeros 20-50% of activations during evaluation, making test accuracy appear 10-30% worse than it actually is!',
            code: `# Step 7: Validation Loop
def evaluate(model, val_loader, criterion, device):
    model.eval()  # Freezes Dropout & BatchNorm updates
    val_loss, correct, total = 0.0, 0, 0
    
    with torch.no_grad():  # Disables Autograd engine (saves massive VRAM)
        for x, y in val_loader:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            preds = model(x)
            loss = criterion(preds, y)
            val_loss += loss.item()
            
            # Metric calculation
            predicted_class = preds.argmax(dim=1)
            correct += (predicted_class == y).sum().item()
            total += y.size(0)
            
    return val_loss / len(val_loader), correct / total`
        },
        8: {
            tag: 'Step 8 of 8',
            title: '💾 8. Resumable Checkpointing & Early Stopping',
            desc: 'Deep learning jobs can crash unexpectedly or get preempted on cloud GPUs. Save a dictionary containing the model weights, optimizer momentum, scaler state, and epoch number so you can resume training seamlessly from where you left off.',
            warning: '⚠️ If skipped: Saving only model.state_dict() loses optimizer momentum buffers and learning rate schedule, meaning you cannot properly resume training.',
            code: `# Step 8: Full State Checkpoint & Early Stopping
best_val_loss = float('inf')

for epoch in range(1, 21):
    train_loss = train_epoch(model, train_loader, optimizer, criterion, device, scaler)
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()
    
    # Save checkpoint when validation improves
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'scaler_state_dict': scaler.state_dict() if scaler else None,
            'best_loss': best_val_loss
        }
        torch.save(checkpoint, 'best_checkpoint.pth')
        print(f"Epoch {epoch}: Saved best model (Val Loss: {val_loss:.4f})")`
        }
    };

    function updateBlueprintUI(step) {
        currentBpStep = step;
        const data = blueprintStepsData[step];
        if (!data) return;

        // Button state
        document.querySelectorAll('.bp-step-btn').forEach(btn => {
            const btnStep = parseInt(btn.getAttribute('data-bp'));
            btn.classList.toggle('active', btnStep === step);
        });

        // Content
        const tagEl = document.getElementById('bpStepTag');
        const titleEl = document.getElementById('bpStepTitle');
        const descEl = document.getElementById('bpStepDesc');
        const warnEl = document.getElementById('bpStepWarning');
        const codeEl = document.getElementById('bpStepCode');

        if (tagEl) tagEl.textContent = data.tag;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (warnEl) warnEl.innerHTML = `<strong>${data.warning.split(':')[0]}:</strong> ${data.warning.split(':').slice(1).join(':')}`;
        if (codeEl) codeEl.textContent = data.code;
    }

    document.querySelectorAll('.bp-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.getAttribute('data-bp'));
            updateBlueprintUI(step);
        });
    });

    const bpCopyBtn = document.getElementById('bpCopyCodeBtn');
    if (bpCopyBtn) {
        bpCopyBtn.addEventListener('click', () => {
            const code = document.getElementById('bpStepCode').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const orig = bpCopyBtn.textContent;
                bpCopyBtn.textContent = 'Copied! ✓';
                bpCopyBtn.classList.add('copied');
                setTimeout(() => {
                    bpCopyBtn.textContent = orig;
                    bpCopyBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    updateBlueprintUI(1);

    // === 10 PRO TRICKS VAULT ENGINE ===
    let currentTrickId = 1;
    const proTricksData = {
        1: {
            title: 'Trick #1: Automatic Mixed Precision (AMP)',
            metricBadge: '⚡ 2.2x Faster Training • 📉 50% VRAM Reduction',
            subtitle: 'Modern NVIDIA GPUs have Tensor Cores optimized for 16-bit floats (FP16/BF16). AMP automatically computes operations in FP16 while maintaining weights in FP32 with dynamic loss scaling.',
            naiveFlaw: 'Standard FP32 — Slow & High VRAM',
            naiveCode: `# Naive training step (Pure 32-bit float)
for x, y in dataloader:
    x, y = x.to(device), y.to(device)
    optimizer.zero_grad()
    out = model(x)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()`,
            naiveCritique: 'Why this is suboptimal: All weights, activations, and gradients are stored in 32-bit floats. Memory bandwidth becomes a major bottleneck and modern Tensor Cores remain completely idle.',
            proBenefit: 'torch.amp.autocast + GradScaler',
            proCode: `# Pro training step with AMP
scaler = torch.amp.GradScaler('cuda')

for x, y in dataloader:
    x, y = x.to(device), y.to(device)
    optimizer.zero_grad()
    
    # 1. Autocast forward pass to FP16 / BF16
    with torch.amp.autocast('cuda', dtype=torch.float16):
        out = model(x)
        loss = criterion(out, y)
        
    # 2. Scale loss to prevent underflow, then backprop
    scaler.scale(loss).backward()
    
    # 3. Unscale and step optimizer
    scaler.step(optimizer)
    scaler.update()`,
            proCritique: 'Why this works: Convolutions and Linear layers run at 16-bit precision on Tensor Cores. GradScaler dynamically scales the loss by 2^16 during backprop to prevent tiny gradients (< 10^-7) from flushing to zero underflow!',
            deepDive: 'Modern GPUs have dedicated silicon (NVIDIA Tensor Cores) specifically wired to execute 4x4 half-precision matrix multiplications in a single clock cycle. By wrapping the forward pass in torch.amp.autocast(), PyTorch automatically casts compute-heavy operations (Linear, Conv2d) to float16, while keeping sensitive operations (Softmax, BatchNorm, Loss) in float32 for numerical stability.'
        },
        2: {
            title: 'Trick #2: Gradient Accumulation',
            metricBadge: '🎯 Simulate Large Batches on 8GB VRAM (e.g. Batch 128 on 8GB)',
            subtitle: 'Training deep models or Transformers with small batches produces noisy, unstable gradients. Gradient accumulation lets you simulate an effective batch size of 128 or 256 without running out of GPU memory.',
            naiveFlaw: 'Batch Size 128 -> CUDA Out of Memory Error',
            naiveCode: `# Naive: Attempting large batch directly
# batch_size = 128 on an 8GB GPU crashes with:
# RuntimeError: CUDA out of memory!
dataloader = DataLoader(dataset, batch_size=128)`,
            naiveCritique: 'Why this is suboptimal: Large batch sizes store activations for 128 full samples simultaneously in VRAM, blowing past GPU memory limits and terminating your training run.',
            proBenefit: 'Accumulate Gradients Across Micro-Batches',
            proCode: `# Pro: Micro-batch 32 accumulated 4 times = Effective 128!
accum_steps = 4
optimizer.zero_grad()

for i, (x, y) in enumerate(dataloader):
    x, y = x.to(device), y.to(device)
    
    out = model(x)
    # Scale loss down so accumulated gradient magnitude matches true batch
    loss = criterion(out, y) / accum_steps
    loss.backward()
    
    # Only update weights every accum_steps iterations
    if (i + 1) % accum_steps == 0 or (i + 1) == len(dataloader):
        optimizer.step()
        optimizer.zero_grad()`,
            proCritique: 'Why this works: PyTorch adds newly computed gradients into param.grad by default. Calling backward() 4 times before optimizer.step() mathematically sums the gradients, matching batch size 128 with only 1/4 the VRAM!',
            deepDive: 'Because gradient addition is linear (d(L1 + L2)/dw = dL1/dw + dL2/dw), dividing each mini-batch loss by N and accumulating gradients across N steps yields the exact mathematical average gradient of a batch N times larger.'
        },
        3: {
            title: 'Trick #3: High-Throughput DataLoader Pipeline',
            metricBadge: '🚀 100% GPU Saturation • Eliminates CPU Data Bottleneck',
            subtitle: 'If your GPU utilization is hovering around 20-30%, your training is CPU-bound! Configuring DataLoader with multi-processing and pinned memory enables direct DMA transfers.',
            naiveFlaw: 'Single-thread default DataLoader',
            naiveCode: `# Naive: default arguments
loader = DataLoader(
    dataset,
    batch_size=64,
    shuffle=True
    # num_workers=0 (runs on main thread!)
    # pin_memory=False (pageable host memory)
)`,
            naiveCritique: 'Why this is suboptimal: The main Python thread has to sequentially read, decode, augment data, and copy it to GPU. The GPU spends 70% of its time idling, waiting for data.',
            proBenefit: 'pin_memory + num_workers + persistent_workers',
            proCode: `# Pro: Max GPU Saturation Pipeline
loader = DataLoader(
    dataset,
    batch_size=64,
    shuffle=True,
    num_workers=4,            # Preload batches across 4 CPU cores
    pin_memory=True,          # Allocate page-locked RAM for Direct Memory Access
    persistent_workers=True,  # Keeps worker processes alive between epochs
    prefetch_factor=2         # Pre-fetches 2 batches per worker in advance
)`,
            proCritique: 'Why this works: Pinned memory allows the GPU to use asynchronous Direct Memory Access (DMA) to copy data over PCIe bus directly without involving the CPU.',
            deepDive: 'Normal host memory is pageable (the OS can swap it to disk). When pin_memory=True, PyTorch locks the memory pages in physical RAM, enabling CUDA drivers to stream data over PCIe using DMA while your CPU processes the next batch simultaneously.'
        },
        4: {
            title: 'Trick #4: Gradient Norm Clipping',
            metricBadge: '🛡️ Zero NaN Losses • Numerical Stability in Transformers & RNNs',
            subtitle: 'Exploding gradients cause parameter weights to jump to infinity or NaN, destroying training mid-run. Gradient clipping caps the global norm to a safe threshold.',
            naiveFlaw: 'Unbounded Gradients -> NaN Divergence',
            naiveCode: `# Naive: stepping directly with unconstrained gradients
loss.backward()
# If gradient spike occurs:
# weights become NaN -> loss becomes NaN forever!
optimizer.step()`,
            naiveCritique: 'Why this is suboptimal: A single large outlier loss produces massive gradients. In deep networks and Transformers, backpropagating through dozens of layers compounds gradient magnitudes exponentially.',
            proBenefit: 'torch.nn.utils.clip_grad_norm_',
            proCode: `# Pro: Global Norm Clipping
loss.backward()

# Clips gradient vector norm to max 1.0
grad_norm = torch.nn.utils.clip_grad_norm_(
    model.parameters(),
    max_norm=1.0,
    norm_type=2.0
)

optimizer.step()`,
            proCritique: 'Why this works: If the Euclidean length of the entire parameter gradient vector exceeds 1.0, PyTorch rescales all gradients proportionally: g = g * (max_norm / total_norm), preserving gradient direction while capping magnitude.',
            deepDive: 'Unlike value clipping (which clamps individual numbers and alters gradient vector angle), norm clipping scales the entire gradient vector uniformly, preserving the exact search direction in parameter space.'
        },
        5: {
            title: 'Trick #5: Learning Rate Warmup & Cosine Decay',
            metricBadge: '📈 1.5-3% Accuracy Gain • Eliminates Early Weight Shocks',
            subtitle: 'Starting training with a high learning rate can destabilize randomly initialized weights. Warming up linearly and then decaying with Cosine Annealing leads to superior generalization.',
            naiveFlaw: 'Constant High Learning Rate',
            naiveCode: `# Naive: static learning rate
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
# Learning rate stays 0.001 for all 100 epochs!
# Model bounces around the loss minima and never settles`,
            naiveCritique: 'Why this is suboptimal: Near the end of training, a large learning rate prevents weights from settling into the narrow sharp minima of the loss landscape, capping final test accuracy.',
            proBenefit: 'CosineAnnealingLR Scheduler',
            proCode: `# Pro: Cosine Annealing with Warm Restarts or Decay
from torch.optim.lr_scheduler import CosineAnnealingLR

optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

# Decays LR following half-cosine curve down to 1e-6
scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

for epoch in range(epochs):
    train_one_epoch(...)
    scheduler.step()  # Updates optimizer learning rate`,
            proCritique: 'Why this works: The learning rate starts high to rapidly explore parameter space, then smoothly decreases like a cosine wave, allowing the optimizer to settle into flat, robust minima.',
            deepDive: 'Empirical deep learning research shows flat minima generalize significantly better to test distributions than sharp minima. Cosine schedules allow rapid descent followed by fine annealing.'
        },
        6: {
            title: 'Trick #6: Resumable Checkpointing',
            metricBadge: '💾 100% Crash Recovery • Preemptible Cloud Safety',
            subtitle: 'Saving only model weights is not enough to resume training. A complete checkpoint must include optimizer momentum, scaler states, and epoch counters.',
            naiveFlaw: 'Saving only model.state_dict()',
            naiveCode: `# Naive checkpoint saving
torch.save(model.state_dict(), 'model.pth')
# Discarded: optimizer momentum, scaler states, epoch count!
# When reloaded, optimizer starts with zero momentum, disrupting training!`,
            naiveCritique: 'Why this is suboptimal: Optimizers like Adam store moving averages of past gradients. If you reload weights with a freshly initialized optimizer, learning rate schedules and momentum are wiped out.',
            proBenefit: 'Dictionary State Checkpointing',
            proCode: `# Pro: Save Complete Training State
checkpoint = {
    'epoch': epoch,
    'model_state': model.state_dict(),
    'optimizer_state': optimizer.state_dict(),
    'scaler_state': scaler.state_dict() if scaler else None,
    'best_loss': best_val_loss
}
torch.save(checkpoint, 'checkpoint_epoch_10.pth')

# To resume:
ckpt = torch.load('checkpoint_epoch_10.pth')
model.load_state_dict(ckpt['model_state'])
optimizer.load_state_dict(ckpt['optimizer_state'])
start_epoch = ckpt['epoch'] + 1`,
            proCritique: 'Why this works: When loaded, Adam immediately resumes its first and second moment velocity buffers (exp_avg, exp_avg_sq) as if the script had never stopped.',
            deepDive: 'In spot/preemptible instances on AWS/GCP, machines can shut down at any second. A comprehensive state dictionary ensures not a single compute hour or learning curve momentum is lost.'
        },
        7: {
            title: 'Trick #7: PyTorch 2.x torch.compile()',
            metricBadge: '⚡ 20-40% Free Speedup • 1-Line Compiler Optimization',
            subtitle: 'PyTorch 2.0 introduced TorchDynamo and TorchInductor, capturing Python code into graph intermediate representations (IR) and generating fused Triton GPU kernels.',
            naiveFlaw: 'Standard Python Eager Mode Execution',
            naiveCode: `# Naive: Standard eager mode
model = MyModel().to(device)
# Every operation launches a separate CUDA kernel!
# e.g., Linear -> launch kernel -> Bias -> launch kernel -> ReLU -> launch kernel`,
            naiveCritique: 'Why this is suboptimal: High CPU-to-GPU kernel launch overhead and intermediate tensor memory roundtrips back and forth between GPU SRAM and HBM.',
            proBenefit: 'model = torch.compile(model)',
            proCode: `# Pro: 1-Line Modern Compilation (PyTorch 2.0+)
model = MyModel().to(device)

# Compiles forward graph into fused C++/Triton GPU kernels
model = torch.compile(model)

# Training loop remains 100% identical!
for x, y in dataloader:
    out = model(x)`,
            proCritique: 'Why this works: TorchInductor fuses operations (like Conv + BatchNorm + ReLU) into a single unified GPU kernel, eliminating GPU memory read/write passes and cutting execution latency.',
            deepDive: 'Eager mode PyTorch writes the result of every intermediate tensor back into global GPU memory. Fused kernels compute operations entirely in ultra-fast on-chip SRAM cache before writing back.'
        },
        8: {
            title: 'Trick #8: Asynchronous GPU Transfer',
            metricBadge: '⏱️ Zero-Copy Asynchronous Transfers • Overlaps Compute & I/O',
            subtitle: 'Moving tensors to GPU with .to(device) normally blocks the CPU until the transfer completes. Using non_blocking=True allows CPU and GPU to work simultaneously.',
            naiveFlaw: 'Blocking Synchronous GPU Copy',
            naiveCode: `# Naive blocking transfer
for x, y in dataloader:
    x = x.to(device)  # CPU pauses and waits for PCIe transfer!
    y = y.to(device)  # CPU pauses again!
    out = model(x)`,
            naiveCritique: 'Why this is suboptimal: The CPU sits stalled during the PCIe bus latency instead of moving forward to prepare the next batch.',
            proBenefit: 'pin_memory + non_blocking=True',
            proCode: `# Pro: Asynchronous Non-Blocking Transfer
# 1. DataLoader MUST have pin_memory=True
loader = DataLoader(dataset, batch_size=64, pin_memory=True)

# 2. Add non_blocking=True
for x, y in loader:
    # Transfers execute in background CUDA stream
    x = x.to(device, non_blocking=True)
    y = y.to(device, non_blocking=True)
    
    out = model(x)  # Compute automatically synchronizes when x arrives`,
            proCritique: 'Why this works: CUDA streams queue the memory transfer asynchronously. The CPU instantly continues execution without blocking, achieving true pipeline parallelism.',
            deepDive: 'NVIDIA GPUs possess separate hardware copy engines and compute engines. non_blocking=True instructs the copy engine to transfer data concurrently while the compute cores finish the previous operation.'
        },
        9: {
            title: 'Trick #9: Zero-Leak Metric Detaching',
            metricBadge: '🧹 Stops #1 Silent OOM Bug • Constant Flat Memory Usage',
            subtitle: 'Accumulating raw loss tensors in Python variables retains the entire autograd computational graph for every batch across the entire epoch, leading to crash.',
            naiveFlaw: 'total_loss += loss (Graph leak!)',
            naiveCode: `# Naive loss accumulation
total_loss = 0.0
for x, y in dataloader:
    out = model(x)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()
    
    total_loss += loss  # DANGER! Holds reference to the entire DAG!`,
            naiveCritique: 'Why this is suboptimal: Because loss is a PyTorch tensor with grad_fn, holding a reference keeps every intermediate activation of every batch in VRAM until epoch end -> OOM crash!',
            proBenefit: 'total_loss += loss.item()',
            proCode: `# Pro: Detach scalar float with .item()
total_loss = 0.0
for x, y in dataloader:
    out = model(x)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()
    
    # .item() extracts raw Python float, freeing all GPU graph memory!
    total_loss += loss.item()`,
            proCritique: 'Why this works: loss.item() converts the 1-element tensor into a standard Python float, letting PyTorch immediately free the backward DAG memory buffer after backward().',
            deepDive: 'PyTorch Autograd keeps intermediate tensors alive as long as any node in the graph is reachable. .item() detaches the scalar value completely from the tensor C++ graph structure.'
        },
        10: {
            title: 'Trick #10: 100% Bulletproof Seeding Recipe',
            metricBadge: '🔬 True Scientific Reproducibility • Eliminates Random Variance',
            subtitle: 'Machine learning papers and production benchmarks require deterministic results. Seeding just torch.manual_seed is not enough; cuDNN convolution algorithms must also be pinned.',
            naiveFlaw: 'torch.manual_seed(42) alone',
            naiveCode: `# Naive seeding: incomplete
torch.manual_seed(42)
# Numpy, Python random, DataLoader worker seeds,
# and cuDNN non-deterministic benchmark modes are still random!`,
            naiveCritique: 'Why this is suboptimal: By default, cuDNN benchmark mode tests different convolution algorithms and picks the fastest, introducing floating point non-determinism across runs.',
            proBenefit: 'Complete 6-Point Seeding Suite',
            proCode: `# Pro: 100% Bulletproof Seed Function
import os, random, numpy as np, torch

def seed_everything(seed=42):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    
    # Force deterministic algorithms in CUDA backend
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    
    # Enforce PyTorch deterministic operations
    torch.use_deterministic_algorithms(True, warn_only=True)

seed_everything(42)`,
            proCritique: 'Why this works: Covers every possible source of entropy: Python hash seeds, NumPy random generators, CPU/GPU random seeds, and GPU convolution execution kernels.',
            deepDive: 'Different CUDA thread scheduling and atomics can cause slight floating-point rounding divergence. Deterministic flags force fixed atomic ordering and predictable algorithmic pathways.'
        }
    };

    function updateTrickUI(trickId) {
        currentTrickId = trickId;
        const data = proTricksData[trickId];
        if (!data) return;

        // Active button
        document.querySelectorAll('.trick-card-btn').forEach(btn => {
            const id = parseInt(btn.getAttribute('data-trick'));
            btn.classList.toggle('active', id === trickId);
        });

        // Content
        const badgeEl = document.getElementById('trickMetricBadge');
        const titleEl = document.getElementById('trickViewerTitle');
        const subEl = document.getElementById('trickViewerSub');
        const flawEl = document.getElementById('naiveFlawTag');
        const naiveCodeEl = document.getElementById('naiveCodePre');
        const naiveCritiqueEl = document.getElementById('naiveCritique');
        const benefitEl = document.getElementById('proBenefitTag');
        const proCodeEl = document.getElementById('proCodePre');
        const proCritiqueEl = document.getElementById('proCritique');
        const deepDiveEl = document.getElementById('trickDeepDiveBody');

        if (badgeEl) badgeEl.textContent = data.metricBadge;
        if (titleEl) titleEl.textContent = data.title;
        if (subEl) subEl.textContent = data.subtitle;
        if (flawEl) flawEl.textContent = data.naiveFlaw;
        if (naiveCodeEl) naiveCodeEl.textContent = data.naiveCode;
        if (naiveCritiqueEl) naiveCritiqueEl.innerHTML = `<strong>Why this is suboptimal:</strong> ${data.naiveCritique.replace('Why this is suboptimal: ', '')}`;
        if (benefitEl) benefitEl.textContent = data.proBenefit;
        if (proCodeEl) proCodeEl.textContent = data.proCode;
        if (proCritiqueEl) proCritiqueEl.innerHTML = `<strong>Why this works:</strong> ${data.proCritique.replace('Why this works: ', '')}`;
        if (deepDiveEl) deepDiveEl.textContent = data.deepDive;
    }

    document.querySelectorAll('.trick-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-trick'));
            updateTrickUI(id);
        });
    });

    const copyProBtn = document.getElementById('copyProTrickBtn');
    if (copyProBtn) {
        copyProBtn.addEventListener('click', () => {
            const code = document.getElementById('proCodePre').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const orig = copyProBtn.textContent;
                copyProBtn.textContent = 'Copied! ✓';
                copyProBtn.classList.add('copied');
                setTimeout(() => {
                    copyProBtn.textContent = orig;
                    copyProBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    updateTrickUI(1);

    // === CODING CHALLENGES TEST SUITE ===
    window.toggleHint = function(hintId) {
        const hintEl = document.getElementById(hintId);
        if (hintEl) {
            hintEl.classList.toggle('show');
        }
    };

    window.testChallenge1 = function() {
        const code = document.getElementById('ch1Input').value;
        const feedback = document.getElementById('ch1Feedback');
        const status = document.getElementById('ch1Status');
        const card = document.getElementById('challenge1Card');

        const hasTranspose = /A\.T|A\.t\(\)|torch\.t\(A\)|transpose/i.test(code);
        const hasMatmul = /@|torch\.matmul|matmul/i.test(code);

        feedback.className = 'feedback-box show';
        if (hasTranspose && hasMatmul) {
            feedback.className += ' success';
            feedback.innerHTML = '<strong>🎉 Excellent!</strong> Transposing tensor A from (4, 8) to (8, 4) allows matrix multiplication with B (4, 16), yielding the exact expected shape (8, 16).';
            status.textContent = 'Passed ✓';
            status.style.color = '#4ade80';
            if (card) card.classList.add('solved');
            showConfetti(card);
        } else {
            feedback.className += ' error';
            feedback.innerHTML = '<strong>❌ Shape Mismatch:</strong> Inner dimensions must match! A is (4, 8) and B is (4, 16). You need <code>A.T @ B</code> so (8, 4) &times; (4, 16) produces (8, 16).';
            status.textContent = 'Failed — Check Hint';
            status.style.color = '#f87171';
        }
    };

    window.testChallenge2 = function() {
        const code = document.getElementById('ch2Input').value;
        const feedback = document.getElementById('ch2Feedback');
        const status = document.getElementById('ch2Status');
        const card = document.getElementById('challenge2Card');

        const hasZeroGrad = /optimizer\.zero_grad\(\)/.test(code);
        const hasLossItem = /loss\.item\(\)/.test(code);
        const hasModelTrain = /model\.train\(\)/.test(code);

        feedback.className = 'feedback-box show';
        if (hasZeroGrad && hasLossItem && hasModelTrain) {
            feedback.className += ' success';
            feedback.innerHTML = '<strong>🎉 Brilliant debugging!</strong> You fixed all 3 bugs: zero_grad() prevents gradient accumulation, loss.item() eliminates the GPU VRAM leak, and model.train() ensures proper dropout/batchnorm mode.';
            status.textContent = 'Passed ✓';
            status.style.color = '#4ade80';
            if (card) card.classList.add('solved');
            showConfetti(card);
        } else {
            let missing = [];
            if (!hasZeroGrad) missing.push('optimizer.zero_grad()');
            if (!hasLossItem) missing.push('loss.item() instead of loss');
            if (!hasModelTrain) missing.push('model.train()');
            feedback.className += ' error';
            feedback.innerHTML = `<strong>❌ Incomplete Fixes:</strong> Still missing or incorrect: ${missing.join(', ')}.`;
            status.textContent = 'Needs Review';
            status.style.color = '#f87171';
        }
    };

    window.testChallenge3 = function() {
        const code = document.getElementById('ch3Input').value;
        const feedback = document.getElementById('ch3Feedback');
        const status = document.getElementById('ch3Status');
        const card = document.getElementById('challenge3Card');

        const hasLen = /def\s+__len__\(self\):/i.test(code) && /return\s+len\(/i.test(code);
        const hasGetItem = /def\s+__getitem__\(self,\s*\w+\):/i.test(code) && /return\s+.*,\s*.*/i.test(code);

        feedback.className = 'feedback-box show';
        if (hasLen && hasGetItem) {
            feedback.className += ' success';
            feedback.innerHTML = '<strong>🎉 Perfect Dataset Class!</strong> Both __len__ and __getitem__ methods are properly implemented, ready to wrap inside a torch.utils.data.DataLoader with batching and shuffle!';
            status.textContent = 'Passed ✓';
            status.style.color = '#4ade80';
            if (card) card.classList.add('solved');
            showConfetti(card);
        } else {
            feedback.className += ' error';
            feedback.innerHTML = '<strong>❌ Method Missing:</strong> A custom Dataset must define both <code>def __len__(self): return len(...)</code> and <code>def __getitem__(self, idx): return self.features[idx], self.labels[idx]</code>.';
            status.textContent = 'Failed';
            status.style.color = '#f87171';
        }
    };

    window.testChallenge4 = function() {
        const val = document.getElementById('ch4Input').value.trim();
        const feedback = document.getElementById('ch4Feedback');
        const status = document.getElementById('ch4Status');
        const card = document.getElementById('challenge4Card');

        feedback.className = 'feedback-box show';
        if (val === '2048') {
            feedback.className += ' success';
            feedback.innerHTML = '<strong>🎉 2,048 is correct!</strong> 32 channels &times; 8 height &times; 8 width = 2,048 flat features. Knowing how to calculate this by hand prevents 95% of PyTorch dimension mismatch errors!';
            status.textContent = 'Passed ✓';
            status.style.color = '#4ade80';
            if (card) card.classList.add('solved');
            showConfetti(card);
        } else {
            feedback.className += ' error';
            feedback.innerHTML = `<strong>❌ Calculated "${val}", but target is 2048.</strong> Calculation: Conv1 (32x32) ➔ Pool1 (16x16) ➔ Conv2 (16x16) ➔ Pool2 (8x8) with 32 channels: 32 &times; 8 &times; 8 = 2048.`;
            status.textContent = 'Incorrect';
            status.style.color = '#f87171';
        }
    };

    window.testChallenge5 = function() {
        const code = document.getElementById('ch5Input').value;
        const feedback = document.getElementById('ch5Feedback');
        const status = document.getElementById('ch5Status');
        const card = document.getElementById('challenge5Card');

        const hasAmp = /torch\.amp\.autocast/i.test(code);
        const hasScale = /scaler\.scale/i.test(code) && /backward/i.test(code);
        const hasAccum = /(step\s*\+\s*1|\bstep\b)\s*%\s*4\s*==\s*0/i.test(code) || /accum_steps/i.test(code);
        const hasStep = /scaler\.step\(\s*optimizer\s*\)/i.test(code);
        const hasUpdate = /scaler\.update\(\)/i.test(code);
        const hasZeroGrad = /optimizer\.zero_grad\(\)/i.test(code);

        feedback.className = 'feedback-box show';
        if (hasAmp && hasScale && hasAccum && hasStep && hasUpdate && hasZeroGrad) {
            feedback.className += ' success';
            feedback.innerHTML = '<strong>🎉 Elite PyTorch Mastery!</strong> You wrote a production-grade training step! Using AMP cuts VRAM and doubles speed on Tensor Cores, while 4-step gradient accumulation simulates a 4x larger batch without running out of GPU memory.';
            status.textContent = 'Passed ✓';
            status.style.color = '#4ade80';
            if (card) card.classList.add('solved');
            showConfetti(card);
        } else {
            let missing = [];
            if (!hasAmp) missing.push('torch.amp.autocast(\'cuda\')');
            if (!hasScale) missing.push('scaler.scale(loss).backward()');
            if (!hasAccum) missing.push('accum condition: (step + 1) % 4 == 0');
            if (!hasStep) missing.push('scaler.step(optimizer)');
            if (!hasUpdate) missing.push('scaler.update()');
            if (!hasZeroGrad) missing.push('optimizer.zero_grad()');
            
            feedback.className += ' error';
            feedback.innerHTML = `<strong>❌ Incomplete Pro Step:</strong> Missing components: ${missing.join(', ')}. Check the hint above for guidance!`;
            status.textContent = 'Needs Revision';
            status.style.color = '#f87171';
        }
    };

    // === PYTORCH CODE STUDIO GENERATOR ===
    let studioConfig = {
        task: 'tabular',
        optimizer: 'adamw',
        loss: 'ce',
        scheduler: true,
        clipGrad: true,
        earlyStopping: true,
        deviceAuto: true,
        amp: true,
        gradAccum: true,
        compile: false,
        fastLoader: true,
        fullCheckpoint: true,
        seeding: true
    };

    function setupCodeStudio() {
        // Task selection
        const taskButtons = document.querySelectorAll('#taskSelector .pill-option');
        taskButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                taskButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                studioConfig.task = btn.getAttribute('data-task');
                generateStudioCode();
            });
        });

        // Optimizer selection
        const optButtons = document.querySelectorAll('#optSelector .pill-option');
        optButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                optButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                studioConfig.optimizer = btn.getAttribute('data-opt');
                generateStudioCode();
            });
        });

        // Loss selection
        const lossButtons = document.querySelectorAll('#lossSelector .pill-option');
        lossButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                lossButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                studioConfig.loss = btn.getAttribute('data-loss');
                generateStudioCode();
            });
        });

        // Checkboxes
        const sCheck = document.getElementById('checkScheduler');
        const cCheck = document.getElementById('checkClipGrad');
        const eCheck = document.getElementById('checkEarlyStopping');
        const dCheck = document.getElementById('checkDeviceAuto');
        const ampCheck = document.getElementById('checkAmp');
        const gaCheck = document.getElementById('checkGradAccum');
        const cmpCheck = document.getElementById('checkCompile');
        const flCheck = document.getElementById('checkFastLoader');
        const fcCheck = document.getElementById('checkFullCheckpoint');
        const sdCheck = document.getElementById('checkSeeding');

        if (sCheck) sCheck.addEventListener('change', (e) => { studioConfig.scheduler = e.target.checked; generateStudioCode(); });
        if (cCheck) cCheck.addEventListener('change', (e) => { studioConfig.clipGrad = e.target.checked; generateStudioCode(); });
        if (eCheck) eCheck.addEventListener('change', (e) => { studioConfig.earlyStopping = e.target.checked; generateStudioCode(); });
        if (dCheck) dCheck.addEventListener('change', (e) => { studioConfig.deviceAuto = e.target.checked; generateStudioCode(); });
        if (ampCheck) ampCheck.addEventListener('change', (e) => { studioConfig.amp = e.target.checked; generateStudioCode(); });
        if (gaCheck) gaCheck.addEventListener('change', (e) => { studioConfig.gradAccum = e.target.checked; generateStudioCode(); });
        if (cmpCheck) cmpCheck.addEventListener('change', (e) => { studioConfig.compile = e.target.checked; generateStudioCode(); });
        if (flCheck) flCheck.addEventListener('change', (e) => { studioConfig.fastLoader = e.target.checked; generateStudioCode(); });
        if (fcCheck) fcCheck.addEventListener('change', (e) => { studioConfig.fullCheckpoint = e.target.checked; generateStudioCode(); });
        if (sdCheck) sdCheck.addEventListener('change', (e) => { studioConfig.seeding = e.target.checked; generateStudioCode(); });

        const copyBtn = document.getElementById('copyGeneratedCodeBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const code = document.getElementById('generatedCodePre').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const orig = copyBtn.textContent;
                    copyBtn.textContent = 'Copied! ✓';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = orig;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });
        }

        const downloadBtn = document.getElementById('downloadTrainScriptBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadTrainScript();
            });
        }

        generateStudioCode();
    }

    function downloadTrainScript() {
        const code = document.getElementById('generatedCodePre').textContent;
        const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'train.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const btn = document.getElementById('downloadTrainScriptBtn');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Downloaded train.py! ✓';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = orig;
                btn.classList.remove('copied');
            }, 2000);
        }
    }

    function generateStudioCode() {
        const pre = document.getElementById('generatedCodePre');
        if (!pre) return;

        let code = `"""\nProduction PyTorch Training Script\nGenerated by Learn PyTorch Code Studio\n\nRun immediately in terminal:\n    pip install torch torchvision\n    python train.py\n"""\n\n`;
        code += `import os\nimport sys\nimport time\nimport random\nimport numpy as np\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\nfrom torch.utils.data import Dataset, DataLoader\n\n`;

        // 1. Seeding
        if (studioConfig.seeding) {
            code += `# ============================================================\n# 1. Reproducibility: Seed Everything Recipe\n# ============================================================\ndef seed_everything(seed=42):\n    random.seed(seed)\n    os.environ['PYTHONHASHSEED'] = str(seed)\n    np.random.seed(seed)\n    torch.manual_seed(seed)\n    torch.cuda.manual_seed_all(seed)\n    torch.backends.cudnn.deterministic = True\n    torch.backends.cudnn.benchmark = False\n\nseed_everything(42)\n\n`;
        }

        // 2. Hardware Device
        if (studioConfig.deviceAuto) {
            code += `# ============================================================\n# 2. Hardware Auto-Detection (CUDA > MPS > CPU)\n# ============================================================\nif torch.cuda.is_available():\n    device = torch.device('cuda')\nelif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():\n    device = torch.device('mps')\nelse:\n    device = torch.device('cpu')\nprint(f"🚀 Training hardware allocated: {device}")\n\n`;
        } else {
            code += `# ============================================================\n# 2. Hardware Device Setup\n# ============================================================\ndevice = torch.device('cpu')\nprint(f"Executing on: {device}")\n\n`;
        }

        // 3. Synthetic Dataset & High-Throughput DataLoader
        code += `# ============================================================\n# 3. Data Pipeline (Synthetic Dataset for Instant Execution)\n# ============================================================\nclass DemoDataset(Dataset):\n    def __init__(self, size=1200, task_type='${studioConfig.task}'):\n        self.size = size\n        self.task_type = task_type\n`;

        if (studioConfig.task === 'tabular') {
            code += `        self.x = torch.randn(size, 20)\n        self.y = (self.x[:, 0] + self.x[:, 1] > 0).long()\n`;
        } else if (studioConfig.task === 'vision') {
            code += `        self.x = torch.randn(size, 3, 32, 32)\n        self.y = torch.randint(0, 10, (size,))\n`;
        } else if (studioConfig.task === 'transfer') {
            code += `        self.x = torch.randn(size, 3, 224, 224)\n        self.y = torch.randint(0, 10, (size,))\n`;
        } else {
            code += `        self.x = torch.randint(1, 5000, (size, 32))\n        self.y = torch.randint(0, 2, (size,))\n`;
        }

        code += `\n    def __len__(self):\n        return self.size\n\n    def __getitem__(self, idx):\n        return self.x[idx], self.y[idx]\n\n`;
        code += `train_dataset = DemoDataset(size=1000)\nval_dataset = DemoDataset(size=200)\n\n`;

        if (studioConfig.fastLoader) {
            code += `# Pro DataLoader: Pinned memory enables direct PCIe DMA transfer\nis_cuda = (device.type == 'cuda')\ntrain_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, pin_memory=is_cuda, num_workers=0)\nval_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, pin_memory=is_cuda, num_workers=0)\n\n`;
        } else {
            code += `train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)\nval_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)\n\n`;
        }

        // 4. Model Architecture
        code += `# ============================================================\n# 4. Neural Network Architecture\n# ============================================================\n`;
        if (studioConfig.task === 'tabular') {
            code += `class TabularNet(nn.Module):\n    def __init__(self, in_features=20, hidden_dim=128, num_classes=2):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Linear(in_features, hidden_dim),\n            nn.BatchNorm1d(hidden_dim),\n            nn.ReLU(),\n            nn.Dropout(0.3),\n            nn.Linear(hidden_dim, hidden_dim // 2),\n            nn.BatchNorm1d(hidden_dim // 2),\n            nn.ReLU(),\n            nn.Dropout(0.3),\n            nn.Linear(hidden_dim // 2, num_classes)\n        )\n\n    def forward(self, x):\n        return self.net(x)\n\nmodel = TabularNet().to(device)\n`;
        } else if (studioConfig.task === 'vision') {
            code += `class VisionNet(nn.Module):\n    def __init__(self, num_classes=10):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, kernel_size=3, padding=1),\n            nn.BatchNorm2d(32),\n            nn.ReLU(inplace=True),\n            nn.MaxPool2d(2, 2),\n            nn.Conv2d(32, 64, kernel_size=3, padding=1),\n            nn.BatchNorm2d(64),\n            nn.ReLU(inplace=True),\n            nn.AdaptiveAvgPool2d((1, 1))\n        )\n        self.classifier = nn.Sequential(\n            nn.Flatten(),\n            nn.Linear(64, num_classes)\n        )\n\n    def forward(self, x):\n        return self.classifier(self.features(x))\n\nmodel = VisionNet().to(device)\n`;
        } else if (studioConfig.task === 'transfer') {
            code += `from torchvision import models\nweights = models.ResNet18_Weights.DEFAULT\nmodel = models.resnet18(weights=weights)\n\n# Freeze pretrained backbone\nfor param in model.parameters():\n    param.requires_grad = False\n\n# Replace classifier\nmodel.fc = nn.Sequential(\n    nn.Linear(model.fc.in_features, 256),\n    nn.ReLU(),\n    nn.Dropout(0.3),\n    nn.Linear(256, 10)\n)\nmodel = model.to(device)\n`;
        } else {
            code += `class SequenceModel(nn.Module):\n    def __init__(self, vocab_size=5000, embed_dim=128, hidden_dim=256, num_classes=2):\n        super().__init__()\n        self.embedding = nn.Embedding(vocab_size, embed_dim)\n        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)\n        self.fc = nn.Linear(hidden_dim * 2, num_classes)\n\n    def forward(self, x):\n        emb = self.embedding(x)\n        out, (hn, cn) = self.lstm(emb)\n        hidden = torch.cat((hn[-2, :, :], hn[-1, :, :]), dim=1)\n        return self.fc(hidden)\n\nmodel = SequenceModel().to(device)\n`;
        }

        if (studioConfig.compile) {
            code += `# PyTorch 2.x compile for fused Triton GPU kernels\ntry:\n    model = torch.compile(model)\n    print("⚡ PyTorch 2.x model compilation active!")\nexcept Exception as e:\n    print(f"Compilation fallback: {e}")\n`;
        }
        code += `\n`;

        // 5. Loss & Optimizer
        code += `# ============================================================\n# 5. Loss Function & Modern Optimizer\n# ============================================================\n`;
        if (studioConfig.loss === 'ce') {
            code += `criterion = nn.CrossEntropyLoss()\n`;
        } else if (studioConfig.loss === 'bce') {
            code += `criterion = nn.BCEWithLogitsLoss()\n`;
        } else {
            code += `criterion = nn.MSELoss()\n`;
        }

        if (studioConfig.optimizer === 'adamw') {
            code += `optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)\n`;
        } else if (studioConfig.optimizer === 'adam') {
            code += `optimizer = optim.Adam(model.parameters(), lr=1e-3)\n`;
        } else {
            code += `optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9, nesterov=True)\n`;
        }

        if (studioConfig.scheduler) {
            code += `scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10, eta_min=1e-6)\n`;
        }
        code += `\n`;

        // 6. Pro Training Epoch Loop
        code += `# ============================================================\n# 6. Pro Training Function (AMP + Accumulation + Clipping)\n# ============================================================\n`;
        if (studioConfig.amp) {
            code += `# Scaler scales loss to prevent underflow in FP16\nscaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None\n\n`;
        }

        code += `def train_one_epoch(model, loader, optimizer, criterion, device${studioConfig.amp ? ', scaler' : ''}):\n`;
        code += `    model.train()\n`;
        code += `    running_loss = 0.0\n`;
        if (studioConfig.gradAccum) {
            code += `    accum_steps = 4  # Simulates 4x larger batch size\n`;
        }
        code += `    optimizer.zero_grad()\n\n`;

        code += `    for step, (batch_x, batch_y) in enumerate(loader):\n`;
        if (studioConfig.fastLoader) {
            code += `        batch_x = batch_x.to(device, non_blocking=True)\n`;
            code += `        batch_y = batch_y.to(device, non_blocking=True)\n`;
        } else {
            code += `        batch_x, batch_y = batch_x.to(device), batch_y.to(device)\n`;
        }

        if (studioConfig.amp) {
            code += `\n        # Forward pass under mixed precision\n`;
            code += `        if scaler is not None:\n`;
            code += `            with torch.amp.autocast('cuda'):\n`;
            code += `                preds = model(batch_x)\n`;
            code += `                loss = criterion(preds, batch_y)${studioConfig.gradAccum ? ' / accum_steps' : ''}\n`;
            code += `            scaler.scale(loss).backward()\n`;
            if (studioConfig.gradAccum) {
                code += `            if (step + 1) % accum_steps == 0 or (step + 1) == len(loader):\n`;
                if (studioConfig.clipGrad) {
                    code += `                scaler.unscale_(optimizer)\n`;
                    code += `                nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `                scaler.step(optimizer)\n`;
                code += `                scaler.update()\n`;
                code += `                optimizer.zero_grad()\n`;
            } else {
                if (studioConfig.clipGrad) {
                    code += `            scaler.unscale_(optimizer)\n`;
                    code += `            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `            scaler.step(optimizer)\n`;
                code += `            scaler.update()\n`;
                code += `            optimizer.zero_grad()\n`;
            }
            code += `        else:\n`;
            code += `            preds = model(batch_x)\n`;
            code += `            loss = criterion(preds, batch_y)${studioConfig.gradAccum ? ' / accum_steps' : ''}\n`;
            code += `            loss.backward()\n`;
            if (studioConfig.gradAccum) {
                code += `            if (step + 1) % accum_steps == 0 or (step + 1) == len(loader):\n`;
                if (studioConfig.clipGrad) {
                    code += `                nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `                optimizer.step()\n`;
                code += `                optimizer.zero_grad()\n`;
            } else {
                if (studioConfig.clipGrad) {
                    code += `            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `            optimizer.step()\n`;
                code += `            optimizer.zero_grad()\n`;
            }
        } else {
            code += `        preds = model(batch_x)\n`;
            code += `        loss = criterion(preds, batch_y)${studioConfig.gradAccum ? ' / accum_steps' : ''}\n`;
            code += `        loss.backward()\n`;
            if (studioConfig.gradAccum) {
                code += `        if (step + 1) % accum_steps == 0 or (step + 1) == len(loader):\n`;
                if (studioConfig.clipGrad) {
                    code += `            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `            optimizer.step()\n`;
                code += `            optimizer.zero_grad()\n`;
            } else {
                if (studioConfig.clipGrad) {
                    code += `        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n`;
                }
                code += `        optimizer.step()\n`;
                code += `        optimizer.zero_grad()\n`;
            }
        }

        code += `\n        # loss.item() detaches float to prevent GPU memory leak\n`;
        code += `        running_loss += loss.item()${studioConfig.gradAccum ? ' * accum_steps' : ''}\n\n`;
        code += `    return running_loss / len(loader)\n\n`;

        // 7. Validation function
        code += `# ============================================================\n# 7. Bulletproof Validation Loop\n# ============================================================\ndef evaluate(model, loader, criterion, device):\n    model.eval()  # Disables Dropout, freezes BatchNorm\n    total_loss, correct, total = 0.0, 0, 0\n\n    with torch.no_grad():  # Disables Autograd memory\n        for batch_x, batch_y in loader:\n            batch_x, batch_y = batch_x.to(device), batch_y.to(device)\n            preds = model(batch_x)\n            loss = criterion(preds, batch_y)\n            total_loss += loss.item()\n\n            if preds.ndim > 1 and preds.size(1) > 1:\n                pred_class = preds.argmax(dim=1)\n                correct += (pred_class == batch_y).sum().item()\n                total += batch_y.size(0)\n\n    acc = (correct / total) if total > 0 else 0.0\n    return total_loss / len(loader), acc\n\n`;

        // 8. Main Execution Loop
        code += `# ============================================================\n# 8. Execution Pipeline & Checkpointing\n# ============================================================\nif __name__ == '__main__':\n    epochs = 5\n    best_val_loss = float('inf')\n    print("Starting training pipeline...")\n\n    for epoch in range(1, epochs + 1):\n        t0 = time.time()\n        train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device${studioConfig.amp ? ', scaler' : ''})\n        val_loss, val_acc = evaluate(model, val_loader, criterion, device)\n`;
        if (studioConfig.scheduler) {
            code += `        scheduler.step()\n`;
        }
        code += `        elapsed = time.time() - t0\n\n`;
        code += `        print(f"Epoch [{epoch}/{epochs}] ({elapsed:.2f}s) | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.1f}%")\n\n`;

        if (studioConfig.fullCheckpoint) {
            code += `        # Save complete resumable state checkpoint\n`;
            code += `        if val_loss < best_val_loss:\n`;
            code += `            best_val_loss = val_loss\n`;
            code += `            checkpoint = {\n`;
            code += `                'epoch': epoch,\n`;
            code += `                'model_state': model.state_dict(),\n`;
            code += `                'optimizer_state': optimizer.state_dict(),\n`;
            if (studioConfig.amp) {
                code += `                'scaler_state': scaler.state_dict() if scaler else None,\n`;
            }
            code += `                'best_loss': best_val_loss\n`;
            code += `            }\n`;
            code += `            torch.save(checkpoint, 'best_model_checkpoint.pth')\n`;
            code += `            print(f"  ⭐ Saved best model checkpoint (loss {best_val_loss:.4f})")\n\n`;
        }

        code += `    print("✅ Training complete! Checkpoint saved as 'best_model_checkpoint.pth'")\n`;

        pre.textContent = code;
    }

    setupCodeStudio();

    // === TASKS & QUESTS SYSTEM ===
    window.toggleTaskSolution = function(solutionId) {
        const sol = document.getElementById(solutionId);
        if (!sol) return;
        const btn = sol.previousElementSibling;
        const isShown = sol.classList.contains('show');
        if (isShown) {
            sol.classList.remove('show');
            if (btn && btn.classList.contains('task-solution-btn')) {
                btn.textContent = '👁️ Show Model Solution & Output';
            }
        } else {
            sol.classList.add('show');
            if (btn && btn.classList.contains('task-solution-btn')) {
                btn.textContent = '🙈 Hide Model Solution';
            }
        }
    };

    function setupTasksSystem() {
        const STORAGE_KEY = 'pytorch_completed_tasks';
        let completedTasks = [];
        try {
            completedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            completedTasks = [];
        }

        const checkboxes = document.querySelectorAll('.task-checkbox');
        const countDisplay = document.getElementById('completedTasksCount');
        const progressBar = document.getElementById('taskProgressBar');
        const filterBtns = document.querySelectorAll('.task-filter-btn');
        const overviewCards = document.querySelectorAll('.task-overview-card');

        function updateTasksUI() {
            const total = 12;
            const doneCount = completedTasks.length;

            if (countDisplay) countDisplay.textContent = doneCount;
            if (progressBar) {
                const pct = Math.round((doneCount / total) * 100);
                progressBar.style.width = pct + '%';
            }

            // Sync checkboxes
            checkboxes.forEach(cb => {
                const taskId = cb.getAttribute('data-task-id');
                cb.checked = completedTasks.includes(taskId);
            });

            // Sync dashboard overview cards
            for (let i = 1; i <= 12; i++) {
                const tid = 't' + i;
                const isDone = completedTasks.includes(tid);
                const card = document.getElementById('card-' + tid);
                const statusPill = document.getElementById('status-' + tid);

                if (card) {
                    if (isDone) {
                        card.classList.add('task-done');
                    } else {
                        card.classList.remove('task-done');
                    }
                }

                if (statusPill) {
                    if (isDone) {
                        statusPill.textContent = '✓ Done';
                        statusPill.classList.add('done');
                    } else {
                        statusPill.textContent = 'Pending';
                        statusPill.classList.remove('done');
                    }
                }
            }
        }

        window.toggleTaskCompleted = function(taskId) {
            if (completedTasks.includes(taskId)) {
                completedTasks = completedTasks.filter(id => id !== taskId);
            } else {
                completedTasks.push(taskId);
                const card = document.getElementById('card-' + taskId);
                if (card) showConfetti(card);
                const taskBox = document.querySelector(`[data-task-id="${taskId}"]`)?.closest('.chapter-task');
                if (taskBox) showConfetti(taskBox);
            }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTasks));
            } catch (e) {}
            updateTasksUI();
        };

        // Make status pills interactive
        for (let i = 1; i <= 12; i++) {
            const tid = 't' + i;
            const statusPill = document.getElementById('status-' + tid);
            if (statusPill) {
                statusPill.title = "Click to toggle completion";
                statusPill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.toggleTaskCompleted(tid);
                });
            }
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const taskId = cb.getAttribute('data-task-id');
                if (cb.checked) {
                    if (!completedTasks.includes(taskId)) completedTasks.push(taskId);
                    const taskBox = cb.closest('.chapter-task');
                    if (taskBox) showConfetti(taskBox);
                } else {
                    completedTasks = completedTasks.filter(id => id !== taskId);
                }

                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTasks));
                } catch (e) {}

                updateTasksUI();
            });
        });

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');

                overviewCards.forEach(card => {
                    const cat = card.getAttribute('data-category');
                    if (filter === 'all' || cat === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Auto-open chapter when clicking "Go to Task ->"
        document.querySelectorAll('.task-jump-link').forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#ch')) {
                    const ch = document.querySelector(href);
                    if (ch) {
                        ch.classList.add('open');
                    }
                }
            });
        });

        updateTasksUI();
    }

    setupTasksSystem();

    // === Initialize ===
    updateProgress();
    updateActiveNavLink();

    console.log(
        '%c🔥 Learn PyTorch %c Built with ❤️',
        'color: #ee4c2c; font-size: 16px; font-weight: bold;',
        'color: #a0a0b8; font-size: 12px;'
    );
});
