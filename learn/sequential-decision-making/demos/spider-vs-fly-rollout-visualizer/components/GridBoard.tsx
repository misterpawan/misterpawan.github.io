import React from 'react';
import { GameState, InteractionState, MoveOption, Spider } from '../types';
import { GRID_SIZE } from '../constants';
import { Bug, Target, Skull, Ghost, Move, MousePointerClick } from 'lucide-react';

interface GridBoardProps {
  gameState: GameState;
  interactionState: InteractionState | null;
  onSelectOption: (option: MoveOption, spiderId?: number) => void;
}

const GridBoard: React.FC<GridBoardProps> = ({ gameState, interactionState, onSelectOption }) => {
  // Create grid cells
  const cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      cells.push({ x, y });
    }
  }

  const getCellContent = (x: number, y: number) => {
    const spider = gameState.spiders.find(s => s.pos.x === x && s.pos.y === y);
    const fly = gameState.flies.find(f => f.pos.x === x && f.pos.y === y && !f.isCaught);
    const deadFly = gameState.flies.find(f => f.pos.x === x && f.pos.y === y && f.isCaught);
    return { spider, fly, deadFly };
  };

  // Helper to find interaction data for a cell
  const getInteractionOverlay = (x: number, y: number) => {
    if (!interactionState) return null;
    
    // SEQUENTIAL MODE
    if (interactionState.mode === 'SEQUENTIAL') {
        const options = interactionState.currentOptions;
        const matchedOption = options.find(opt => opt.position.x === x && opt.position.y === y);
        const activeSpider = gameState.spiders[interactionState.activeSpiderIndex!];
        const isActiveSpider = activeSpider.pos.x === x && activeSpider.pos.y === y;
        
        // Find ghost traces for committed moves
        const committedTrace = [...(interactionState.committedMoves?.entries() || [])].find(([id, pos]) => pos.x === x && pos.y === y);

        return { 
            matchedOption, 
            isActiveSpider, 
            committedTrace: committedTrace ? gameState.spiders.find(s=>s.id === committedTrace[0]) : null,
            spiderColor: activeSpider.color
        };
    }

    // SIMULTANEOUS MODE
    if (interactionState.mode === 'SIMULTANEOUS' && interactionState.simultaneousOptions) {
        // We need to check if this cell is an option for ANY spider
        // AND if it is the currently DRAFTED move for that spider
        
        const overlays = [];
        
        for (const [spiderId, options] of interactionState.simultaneousOptions.entries()) {
            const spider = gameState.spiders.find(s => s.id === spiderId);
            if(!spider) continue;
            
            const option = options.find(o => o.position.x === x && o.position.y === y);
            const isDrafted = interactionState.draftMoves?.get(spiderId)?.x === x && 
                              interactionState.draftMoves?.get(spiderId)?.y === y;

            if (option) {
                overlays.push({
                    spiderId,
                    spiderColor: spider.color,
                    option,
                    isDrafted
                });
            }
        }
        
        return { simultaneousOverlays: overlays };
    }

    return null;
  };

  return (
    <div 
      className="relative bg-white border-4 border-slate-200 rounded-xl shadow-lg overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        aspectRatio: '1/1',
        maxWidth: '500px',
        width: '100%'
      }}
    >
      {cells.map((cell) => {
        const { spider, fly, deadFly } = getCellContent(cell.x, cell.y);
        const interaction = getInteractionOverlay(cell.x, cell.y);
        
        // --- RENDERING LOGIC ---
        
        // 1. Simultaneous Overlays (Multiple badges per cell possible)
        const simOverlays = interaction?.simultaneousOverlays || [];
        const isSimOption = simOverlays.length > 0;

        // 2. Sequential Logic
        const isSeqOption = !!interaction?.matchedOption;
        const isBestSeqOption = isSeqOption && interaction?.matchedOption?.cost === Math.min(...(interactionState?.currentOptions.map(o=>o.cost) || []));

        // Click Handler
        const handleClick = () => {
            if (isSeqOption && interaction?.matchedOption) {
                onSelectOption(interaction.matchedOption);
            }
            if (isSimOption) {
                // If multiple spiders have options here, prioritize the one that isn't already selected?
                // Or just pick the first one. For simple UI, pick first.
                // Ideally, if user clicks S1's option, we select for S1.
                // If collision, we might need a small sub-menu, but let's assume direct click for now.
                if (simOverlays.length > 0) {
                   onSelectOption(simOverlays[0].option, simOverlays[0].spiderId);
                }
            }
        };

        return (
          <div 
            key={`${cell.x}-${cell.y}`} 
            onClick={handleClick}
            className={`
                border border-slate-100 flex items-center justify-center relative transition-all duration-200
                ${(cell.x + cell.y) % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                ${isSeqOption ? 'cursor-pointer hover:bg-blue-50 z-30' : ''}
                ${isSimOption ? 'cursor-pointer hover:bg-slate-100 z-30' : ''}
            `}
          >
            {/* SEQUENTIAL: Committed Move Indicator (Ghost trace) */}
            {interaction?.committedTrace && (
                <div className="absolute w-2 h-2 rounded-full z-0" style={{backgroundColor: interaction.committedTrace.color}}></div>
            )}

            {/* SEQUENTIAL: Selection Overlay */}
            {isSeqOption && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${isBestSeqOption ? 'bg-green-100/60 ring-2 ring-inset ring-green-400' : 'bg-slate-200/40'}`}>
                    <span className={`text-[10px] font-bold px-1 rounded ${isBestSeqOption ? 'bg-green-600 text-white' : 'bg-slate-500 text-white'}`}>
                        {interaction?.matchedOption?.cost}
                    </span>
                </div>
            )}

            {/* SIMULTANEOUS: Overlays */}
            {simOverlays.length > 0 && (
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-0.5 p-0.5 z-40 pointer-events-none">
                    {simOverlays.map((ov, idx) => (
                        <div 
                            key={idx}
                            className={`
                                flex items-center justify-center rounded px-1 py-0.5 text-[9px] font-bold shadow-sm transition-transform
                                ${ov.isDrafted ? 'ring-2 ring-inset ring-white scale-110' : 'opacity-70 scale-90'}
                            `}
                            style={{ 
                                backgroundColor: ov.isDrafted ? ov.spiderColor : '#f1f5f9',
                                color: ov.isDrafted ? 'white' : ov.spiderColor,
                                border: `1px solid ${ov.spiderColor}`
                            }}
                        >
                            {ov.option.cost}
                        </div>
                    ))}
                </div>
            )}


            {/* Active Spider Highlight (Sequential) */}
            {interaction?.isActiveSpider && (
                <div className="absolute inset-0 ring-4 ring-blue-400 ring-opacity-50 animate-pulse z-0"></div>
            )}

            {/* Render Fly */}
            {fly && (
              <div className="absolute z-10 text-amber-500 drop-shadow-sm">
                 <Target size={20} fill="currentColor" fillOpacity={0.2} />
              </div>
            )}
            
            {/* Render Dead Fly */}
            {deadFly && (
                 <div className="absolute z-0 opacity-20 text-slate-300 scale-75">
                    <Skull size={16} />
                 </div>
            )}

            {/* Render Spider */}
            {spider && (
              <div 
                className={`relative z-20 transition-all duration-300 ease-out transform ${interaction?.isActiveSpider ? 'scale-110' : 'scale-100'}`}
                style={{ color: spider.color }}
              >
                 <Ghost size={24} strokeWidth={2.5} />
              </div>
            )}
            
            {/* Grid Coordinates */}
            <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-300 select-none">
              {cell.x},{cell.y}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GridBoard;