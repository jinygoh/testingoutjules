document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('chess-board');
    const ctx = canvas.getContext('2d');
    const currentTurnDisplay = document.getElementById('current-turn');
    const gameMessageDisplay = document.getElementById('game-message');
    const restartButton = document.getElementById('restart-button');
    const whiteCapturedList = document.getElementById('white-captured-list');
    const blackCapturedList = document.getElementById('black-captured-list');

    // --- Constants ---
    const BOARD_SIZE = 8; // 8x8 board
    const SQUARE_SIZE = canvas.width / BOARD_SIZE; // Size of each square in pixels

    const PIECE_COLORS = { WHITE: 'white', BLACK: 'black' }; // Piece colors
    const PIECE_TYPES = {
        PAWN: 'Pawn', ROOK: 'Rook', KNIGHT: 'Knight', BISHOP: 'Bishop', QUEEN: 'Queen', KING: 'King'
    };

    // AP/HP values (easily configurable)
    const PIECE_STATS = {
        [PIECE_TYPES.PAWN]:   { AP: 1, HP: 3,  ICON: { white: '♙', black: '♟︎' } },
        [PIECE_TYPES.KNIGHT]: { AP: 2, HP: 5,  ICON: { white: '♘', black: '♞' } },
        [PIECE_TYPES.BISHOP]: { AP: 2, HP: 5,  ICON: { white: '♗', black: '♝' } },
        [PIECE_TYPES.ROOK]:   { AP: 3, HP: 8,  ICON: { white: '♖', black: '♜' } },
        [PIECE_TYPES.QUEEN]:  { AP: 4, HP: 10, ICON: { white: '♕', black: '♛' } },
        [PIECE_TYPES.KING]:   { AP: 1, HP: 15, ICON: { white: '♔', black: '♚' } }
    };

    let board = []; // 2D array representing the board state
    let currentPlayer = PIECE_COLORS.WHITE;
    let selectedPiece = null; // { piece, row, col }
    let legalMoves = []; // Array of {row, col} for the selected piece
    let gameEnded = false;
    let animationState = {
        isAnimating: false,
        piece: null, // The piece object being animated
        startYRow: 0, startXCol: 0, // Starting board coordinates (row, col)
        endYRow: 0, endXCol: 0,     // Ending board coordinates (row, col)
        progress: 0, // 0 to 1 for animation
        onComplete: null, // Callback function when animation finishes
        attackFlashTarget: null, // {row, col, durationFrames}
        removalEffects: [] // [{icon, color, row, col, durationFrames, maxDuration, startOpacity}]
    };

    // --- Game Initialization ---
    function createPiece(type, color, row, col) {
        const stats = PIECE_STATS[type];
        return {
            type,
            color,
            AP: stats.AP,
            maxHP: stats.HP,
            currentHP: stats.HP,
            icon: stats.ICON[color],
            row,
            col,
            hasMoved: false,
            canBeEnPassanted: false // For pawns
        };
    }

    function initializeBoard() {
        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

        // Place Pawns
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[1][c] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK, 1, c);
            board[6][c] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE, 6, c);
        }

        // Place Rooks
        board[0][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK, 0, 0);
        board[0][7] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK, 0, 7);
        board[7][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE, 7, 0);
        board[7][7] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE, 7, 7);

        // Place Knights
        board[0][1] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.BLACK, 0, 1);
        board[0][6] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.BLACK, 0, 6);
        board[7][1] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE, 7, 1);
        board[7][6] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE, 7, 6);

        // Place Bishops
        board[0][2] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.BLACK, 0, 2);
        board[0][5] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.BLACK, 0, 5);
        board[7][2] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE, 7, 2);
        board[7][5] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE, 7, 5);

        // Place Queens
        board[0][3] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.BLACK, 0, 3);
        board[7][3] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE, 7, 3);

        // Place Kings
        board[0][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.BLACK, 0, 4);
        board[7][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE, 7, 4);

        currentPlayer = PIECE_COLORS.WHITE;
        selectedPiece = null;
        legalMoves = [];
        gameEnded = false;
        updateGameStatusDisplay();
        whiteCapturedList.innerHTML = '';
        blackCapturedList.innerHTML = '';
        gameMessageDisplay.textContent = '';
        drawGame();
    }

    // --- Drawing Logic ---
    function drawBoard() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                ctx.fillStyle = (r + c) % 2 === 0 ? '#e0e0e0' : '#6a4a3a'; // Light/Dark squares
                ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            }
        }
    }

function drawSinglePieceOnBoard(ctx, piece, boardRow, boardCol) {
    // Simple text-based pixel art
    ctx.imageSmoothingEnabled = false;
    // @ts-ignore
    ctx.webkitImageSmoothingEnabled = false; ctx.mozImageSmoothingEnabled = false; ctx.msImageSmoothingEnabled = false;

    ctx.font = `bold ${SQUARE_SIZE * 0.7}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textX = boardCol * SQUARE_SIZE + SQUARE_SIZE / 2;
    const textY = boardRow * SQUARE_SIZE + SQUARE_SIZE / 2 - SQUARE_SIZE * 0.05;

    ctx.strokeStyle = piece.color === PIECE_COLORS.WHITE ? '#222' : '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeText(piece.icon, textX, textY);
    ctx.fillStyle = piece.color === PIECE_COLORS.WHITE ? '#f0f0f0' : '#101010';
    ctx.fillText(piece.icon, textX, textY);

    // Draw AP Text
    ctx.font = `bold ${SQUARE_SIZE * 0.18}px 'Courier New', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const apTextX = boardCol * SQUARE_SIZE + 3;
    const apTextY = boardRow * SQUARE_SIZE + 3;
    ctx.fillStyle = '#000';
    ctx.fillText(`AP:${piece.AP}`, apTextX + 1, apTextY + 1);
    ctx.fillStyle = piece.color === PIECE_COLORS.WHITE ? '#ff8c00' : '#ffae42';
    ctx.fillText(`AP:${piece.AP}`, apTextX, apTextY);

    // Draw HP Bar
    const hpBarWidth = SQUARE_SIZE * 0.8;
    const hpBarHeight = 6;
    const hpBarX = boardCol * SQUARE_SIZE + (SQUARE_SIZE - hpBarWidth) / 2;
    const hpBarY = boardRow * SQUARE_SIZE + SQUARE_SIZE - hpBarHeight - 3;
    const currentHpWidth = (piece.currentHP / piece.maxHP) * hpBarWidth;

    ctx.fillStyle = '#444';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    ctx.fillStyle = piece.currentHP / piece.maxHP > 0.6 ? '#20c20e' : (piece.currentHP / piece.maxHP > 0.3 ? '#f0e040' : '#d44040');
    ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
}

function drawPieces() { // Draws all pieces currently on the logical board
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            // If a piece is animating FROM this square, it's drawn by drawAnimatedPiece, not here.
            if (animationState.isAnimating &&
                animationState.piece === board[r][c] &&
                animationState.startYRow === r && animationState.startXCol === c) {
                continue;
            }

            const piece = board[r][c];
            if (piece) {
                drawSinglePieceOnBoard(ctx, piece, r, c);

                // Attack Flash Effect directly on the square, drawn on top of the piece
                if (animationState.attackFlashTarget && animationState.attackFlashTarget.row === r && animationState.attackFlashTarget.col === c) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Semi-transparent red flash
                    ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
                }
            }
        }
    }
}

// New function to draw the currently ANIMATING piece at interpolated PIXEL coordinates
function drawAnimatedPiece(ctx) {
    if (!animationState.isAnimating || !animationState.piece) return;

    const piece = animationState.piece;
    const progress = animationState.progress;

    const startPixelX = animationState.startXCol * SQUARE_SIZE;
    const startPixelY = animationState.startYRow * SQUARE_SIZE;
    const endPixelX = animationState.endXCol * SQUARE_SIZE;
    const endPixelY = animationState.endYRow * SQUARE_SIZE;

    const currentPixelX = startPixelX + (endPixelX - startPixelX) * progress; // Top-left of where the piece square would be
    const currentPixelY = startPixelY + (endPixelY - startPixelY) * progress;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // @ts-ignore
    ctx.webkitImageSmoothingEnabled = false; ctx.mozImageSmoothingEnabled = false; ctx.msImageSmoothingEnabled = false;

    // --- Icon ---
    ctx.font = `bold ${SQUARE_SIZE * 0.7}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iconX = currentPixelX + SQUARE_SIZE / 2;
    const iconY = currentPixelY + SQUARE_SIZE / 2 - SQUARE_SIZE * 0.05;
    ctx.strokeStyle = piece.color === PIECE_COLORS.WHITE ? '#222' : '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeText(piece.icon, iconX, iconY);
    ctx.fillStyle = piece.color === PIECE_COLORS.WHITE ? '#f0f0f0' : '#101010';
    ctx.fillText(piece.icon, iconX, iconY);

    // --- AP Text ---
    ctx.font = `bold ${SQUARE_SIZE * 0.18}px 'Courier New', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const apTextX = currentPixelX + 3;
    const apTextY = currentPixelY + 3;
    ctx.fillStyle = '#000';
    ctx.fillText(`AP:${piece.AP}`, apTextX + 1, apTextY + 1);
    ctx.fillStyle = piece.color === PIECE_COLORS.WHITE ? '#ff8c00' : '#ffae42';
    ctx.fillText(`AP:${piece.AP}`, apTextX, apTextY);

    // --- HP Bar ---
    // (Only draw HP if it's not an attack flash, or adjust logic) - for now, always draw
    const hpBarWidth = SQUARE_SIZE * 0.8;
    const hpBarHeight = 6;
    const hpBarX = currentPixelX + (SQUARE_SIZE - hpBarWidth) / 2;
    const hpBarY = currentPixelY + SQUARE_SIZE - hpBarHeight - 3;
    const currentHpWidth = (piece.currentHP / piece.maxHP) * hpBarWidth; // Use piece's current HP
    ctx.fillStyle = '#444';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    ctx.fillStyle = piece.currentHP / piece.maxHP > 0.6 ? '#20c20e' : (piece.currentHP / piece.maxHP > 0.3 ? '#f0e040' : '#d44040');
    ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.restore();
}

    function drawHighlights() {
        if (selectedPiece) {
            // Highlight selected piece's square
            ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
            ctx.fillRect(selectedPiece.col * SQUARE_SIZE, selectedPiece.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }

        legalMoves.forEach(move => {
            ctx.fillStyle = board[move.row][move.col] ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.3)'; // Red for attack, green for move
            ctx.beginPath();
            ctx.arc(move.col * SQUARE_SIZE + SQUARE_SIZE / 2, move.row * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        drawPieces();
        if (animationState.isAnimating && animationState.piece) {
             // Draw animated piece on top of static pieces, but under highlights/effects
            drawAnimatedPiece(ctx);
        }
        drawRemovalEffects(ctx);
        drawHighlights();

        let needsRedraw = false;

        // Update animation states for the NEXT frame
        if (animationState.attackFlashTarget) {
            animationState.attackFlashTarget.durationFrames--;
            if (animationState.attackFlashTarget.durationFrames <= 0) {
                animationState.attackFlashTarget = null;
            }
            needsRedraw = true;
        }

        if (animationState.removalEffects.length > 0) {
            animationState.removalEffects = animationState.removalEffects.filter(effect => {
                effect.durationFrames--;
                return effect.durationFrames > 0;
            });
            needsRedraw = true;
        }

        // Update piece sliding animation
        if (animationState.isAnimating) {
            const animationSpeed = 0.1; // Progress per frame; 10 frames for full animation
            animationState.progress += animationSpeed;
            if (animationState.progress >= 1) {
                animationState.progress = 1;
                // Call onComplete which will handle the actual board update
                if (animationState.onComplete) {
                    animationState.onComplete(); // This will set isAnimating to false
                }
            }
            needsRedraw = true;
        }

        if (needsRedraw) {
            requestAnimationFrame(drawGame);
        }
    }

function drawRemovalEffects(ctx) {
    animationState.removalEffects.forEach(effect => {
        const piece = effect;
        const textX = effect.col * SQUARE_SIZE + SQUARE_SIZE / 2;
        // Adjusted Y to match how pieces are drawn, including HP bar consideration that's not here
        // but keeping Y consistent with where a piece icon *would* be.
        const textY = effect.row * SQUARE_SIZE + SQUARE_SIZE / 2 - SQUARE_SIZE * 0.05;
        const opacity = effect.durationFrames / effect.maxDuration;

        ctx.save();
        ctx.globalAlpha = Math.max(0, opacity); // Ensure opacity doesn't go negative

        // Simplified drawing for removal - just the icon, no AP/HP
        ctx.font = `bold ${SQUARE_SIZE * 0.7}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Determine color based on original piece color for the text
        const originalPieceColorStyle = piece.color === PIECE_COLORS.WHITE ? '#f0f0f0' : '#101010';
        const originalOutlineColorStyle = piece.color === PIECE_COLORS.WHITE ? '#222' : '#ddd';

        ctx.strokeStyle = originalOutlineColorStyle;
        ctx.lineWidth = 2;
        ctx.strokeText(piece.icon, textX, textY);

        ctx.fillStyle = originalPieceColorStyle;
        ctx.fillText(piece.icon, textX, textY);

        ctx.restore();
    });
}


    // --- Game Logic ---
    function isValidSquare(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    // Placeholder for getLegalMoves - This will be very complex
    function getLegalMovesForPiece(piece, r, c, checkKingSafety = true) {
        if (!piece) return [];
        let moves = [];
        // This needs to be implemented for each piece type according to chess rules
        // For now, a simple "can move one square any direction" for testing
        // IMPORTANT: THIS IS A TEMPORARY PLACEHOLDER
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        switch (piece.type) {
            case PIECE_TYPES.PAWN:
                moves.push(...getPawnMoves(piece, r, c));
                break;
            case PIECE_TYPES.ROOK:
                moves.push(...getSlidingMoves(piece, r, c, [[-1,0],[1,0],[0,-1],[0,1]]));
                break;
            case PIECE_TYPES.KNIGHT:
                moves.push(...getKnightMoves(piece, r, c));
                break;
            case PIECE_TYPES.BISHOP:
                moves.push(...getSlidingMoves(piece, r, c, [[-1,-1],[-1,1],[1,-1],[1,1]]));
                break;
            case PIECE_TYPES.QUEEN:
                moves.push(...getSlidingMoves(piece, r, c, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]));
                break;
            case PIECE_TYPES.KING:
                moves.push(...getKingMoves(piece, r, c));
                break;
            default:
                // Fallback for now, should not happen with typed pieces
                directions.forEach(dir => {
                    const newRow = r + dir[0];
                    const newCol = c + dir[1];
                    if (isValidSquare(newRow, newCol)) {
                        const targetPiece = board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                });
        }

        // Filter moves that would put the king in check (if checkKingSafety is true)
        // This is a critical part of chess logic.
        // For now, we'll skip this for brevity in the initial structure.
        // It will be added in a subsequent step.
        if (checkKingSafety) {
            moves = moves.filter(move => {
                // Simulate the move
                const originalPieceAtTarget = board[move.row][move.col];
                const originalPieceAtSource = board[r][c];
                board[move.row][move.col] = originalPieceAtSource;
                board[r][c] = null;

                const kingInCheck = isKingInCheck(piece.color);

                // Revert the move
                board[r][c] = originalPieceAtSource;
                board[move.row][move.col] = originalPieceAtTarget;

                return !kingInCheck;
            });
        }

        return moves;
    }

    // --- Piece Specific Move Logic (to be expanded) ---
    function getPawnMoves(piece, r, c) {
        const moves = [];
        const direction = piece.color === PIECE_COLORS.WHITE ? -1 : 1;
        const startRow = piece.color === PIECE_COLORS.WHITE ? 6 : 1;

        // Forward one square
        if (isValidSquare(r + direction, c) && !board[r + direction][c]) {
            moves.push({ row: r + direction, col: c, type: 'move' });
            // Forward two squares (from starting position)
            if (r === startRow && isValidSquare(r + 2 * direction, c) && !board[r + 2 * direction][c]) {
                moves.push({ row: r + 2 * direction, col: c, type: 'move', enPassantEligible: true });
            }
        }
        // Diagonal captures
        [-1, 1].forEach(dc => {
            if (isValidSquare(r + direction, c + dc)) {
                const target = board[r + direction][c + dc];
                if (target && target.color !== piece.color) {
                    moves.push({ row: r + direction, col: c + dc, type: 'attack' });
                }
                // En Passant check
                const enPassantTarget = board[r][c + dc];
                if (enPassantTarget && enPassantTarget.color !== piece.color &&
                    enPassantTarget.type === PIECE_TYPES.PAWN && enPassantTarget.canBeEnPassanted) {
                     moves.push({ row: r + direction, col: c + dc, type: 'enpassant' });
                }
            }
        });
        return moves;
    }

    function getSlidingMoves(piece, r, c, directions) {
        const moves = [];
        directions.forEach(dir => {
            for (let i = 1; i < BOARD_SIZE; i++) {
                const newRow = r + dir[0] * i;
                const newCol = c + dir[1] * i;
                if (!isValidSquare(newRow, newCol)) break;
                const target = board[newRow][newCol];
                if (target) {
                    if (target.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol, type: 'attack' });
                    }
                    break; // Blocked by a piece
                }
                moves.push({ row: newRow, col: newCol, type: 'move' });
            }
        });
        return moves;
    }

    function getKnightMoves(piece, r, c) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(move => {
            const newRow = r + move[0];
            const newCol = c + move[1];
            if (isValidSquare(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol, type: target ? 'attack' : 'move' });
                }
            }
        });
        return moves;
    }

    function getKingMoves(piece, r, c) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1], [0, -1],
            [0, 1], [1, -1], [1, 0], [1, 1]
        ];
        kingMoves.forEach(move => {
            const newRow = r + move[0];
            const newCol = c + move[1];
            if (isValidSquare(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol, type: target ? 'attack' : 'move' });
                }
            }
        });
        // Castling (Simplified - does not check for squares under attack yet)
        if (!piece.hasMoved) {
            // Kingside
            if (!board[r][c+1] && !board[r][c+2] && board[r][c+3] && board[r][c+3].type === PIECE_TYPES.ROOK && !board[r][c+3].hasMoved) {
                if (canCastle(piece.color, 'kingside')) {
                    moves.push({ row: r, col: c + 2, type: 'castle', side: 'kingside' });
                }
            }
            // Queenside
            if (!board[r][c-1] && !board[r][c-2] && !board[r][c-3] && board[r][c-4] && board[r][c-4].type === PIECE_TYPES.ROOK && !board[r][c-4].hasMoved) {
                 if (canCastle(piece.color, 'queenside')) {
                    moves.push({ row: r, col: c - 2, type: 'castle', side: 'queenside' });
                }
            }
        }
        return moves;
    }

    function canCastle(color, side) {
        const king = findKing(color);
        if (!king || king.piece.hasMoved) return false;
        if (isSquareAttacked(king.row, king.col, getOpponentColor(color))) return false; // King in check

        const r = king.row;
        const kingCol = king.col;

        if (side === 'kingside') {
            const rook = board[r][BOARD_SIZE -1];
            if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.hasMoved) return false;
            for (let c = kingCol + 1; c < BOARD_SIZE -1; c++) {
                if (board[r][c] || isSquareAttacked(r, c, getOpponentColor(color))) return false;
            }
            if (isSquareAttacked(r, kingCol + 2, getOpponentColor(color))) return false; // Check square king moves to
        } else { // queenside
            const rook = board[r][0];
             if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.hasMoved) return false;
            for (let c = kingCol - 1; c > 0; c--) {
                 if (board[r][c] || isSquareAttacked(r, c, getOpponentColor(color))) return false;
            }
            if (isSquareAttacked(r, kingCol - 2, getOpponentColor(color))) return false; // Check square king moves to
        }
        return true;
    }


    function findKing(color) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = board[r][c];
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
                    return { piece, row: r, col: c };
                }
            }
        }
        return null; // Should not happen in a normal game
    }

    function isKingInCheck(kingColor) {
        const kingPos = findKing(kingColor);
        if (!kingPos) return false; // Should not happen
        return isSquareAttacked(kingPos.row, kingPos.col, getOpponentColor(kingColor));
    }

    function isSquareAttacked(row, col, attackerColor) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = board[r][c];
                if (piece && piece.color === attackerColor) {
                    // Get moves without king safety check to avoid infinite recursion
                    const attacks = getLegalMovesForPiece(piece, r, c, false);
                    if (attacks.some(attack => attack.row === row && attack.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getOpponentColor(color) {
        return color === PIECE_COLORS.WHITE ? PIECE_COLORS.BLACK : PIECE_COLORS.WHITE;
    }

function makeMove(pieceToMove, fromRow, fromCol, toRow, toCol, moveType) {
    const originalTargetPieceOnBoard = board[toRow][toCol]; // What's on the square *before* any interaction

    animationState.isAnimating = true;
    animationState.piece = pieceToMove;
    animationState.startYRow = fromRow;
    animationState.startXCol = fromCol;
    animationState.endYRow = toRow;
    animationState.endXCol = toCol;
    animationState.progress = 0;

    let preAnimationMessage = '';

    // --- Pre-animation Attack Logic ---
    if (originalTargetPieceOnBoard && originalTargetPieceOnBoard.color !== pieceToMove.color) {
        const targetPieceRef = board[toRow][toCol]; // Direct reference to the piece on board for HP update
        targetPieceRef.currentHP -= pieceToMove.AP;

        animationState.attackFlashTarget = { row: toRow, col: toCol, durationFrames: 10 };
        preAnimationMessage = `${pieceToMove.color} ${pieceToMove.type} attacks ${targetPieceRef.color} ${targetPieceRef.type}. HP: ${targetPieceRef.currentHP}/${targetPieceRef.maxHP}.`;

        if (targetPieceRef.currentHP <= 0) {
            const defeatedPieceForUI = { ...targetPieceRef };

            animationState.removalEffects.push({
                icon: targetPieceRef.icon,
                color: targetPieceRef.color,
                row: toRow, col: toCol,
                durationFrames: 20, maxDuration: 20
            });

            board[toRow][toCol] = null; // Target piece is removed from board logically *now*
            preAnimationMessage += ` ${defeatedPieceForUI.type} defeated!`;
            addCapturedPieceToUI(defeatedPieceForUI);

            if (defeatedPieceForUI.type === PIECE_TYPES.KING) {
                updateGameStatusDisplay(preAnimationMessage);
                endGame(`${getOpponentColor(defeatedPieceForUI.color)} wins by defeating the King!`); // Winner is current player
                animationState.isAnimating = false;
                animationState.onComplete = null;
                drawGame(); // Final draw
                return;
            }
        } else {
            // Target survived the attack. Attacker does not move.
            animationState.isAnimating = false; // No slide animation for the attacker.
            animationState.onComplete = null;

            finalizeMove(pieceToMove, fromRow, fromCol, fromRow, fromCol, 'attack_no_move', targetPieceRef);
            updateGameStatusDisplay(preAnimationMessage);
            selectedPiece = null;
            legalMoves = [];
            drawGame();
            return;
        }
    }

    // If we reach here, the piece is sliding (either to empty or to a square just cleared)
    // Piece is "lifted" from its start square for animation.
    // The actual board[fromRow][fromCol] = null will happen in onComplete or finalizeMove.
    // For drawing purposes, drawPieces checks animationState.
    board[fromRow][fromCol] = null; // Logically lift the piece for animation

    animationState.onComplete = () => {
        animationState.isAnimating = false;
        // animationState.piece is still pieceToMove here

        finalizeMove(pieceToMove, fromRow, fromCol, toRow, toCol, moveType, originalTargetPieceOnBoard);

        selectedPiece = null;
        legalMoves = [];

        // Check if game ended during finalizeMove (e.g. checkmate)
        if (!gameEnded) {
            drawGame(); // Redraw once at the very end to reflect final state if game continues
        }
    };

    updateGameStatusDisplay(preAnimationMessage);
    requestAnimationFrame(drawGame); // Start animation loop
}

// Contains the logic that happens *after* a piece has visually moved or attack resolved without moving
function finalizeMove(piece, fromRowLogic, fromColLogic, toRowLogic, toColLogic, moveTypeLogic, originalTarget) {
    // If the piece actually moved (i.e., didn't just attack a survivor and stayed put)
    if (moveTypeLogic !== 'attack_no_move') {
        board[toRowLogic][toColLogic] = piece; // Place the piece logically on the destination
        // board[fromRowLogic][fromColLogic] was already set to null before animation started.
        piece.row = toRowLogic;
        piece.col = toColLogic;
    }
    // For all moves, even attack_no_move, the piece has "acted"
    piece.hasMoved = true;

    // Reset en passant eligibility for opponent's pawns (should happen for current player's turn completion)
    // This was player-specific, so it's fine here.
    for (let r_idx = 0; r_idx < BOARD_SIZE; r_idx++) {
        for (let c_idx = 0; c_idx < BOARD_SIZE; c_idx++) {
            let p = board[r_idx][c_idx];
            if (p && p.type === PIECE_TYPES.PAWN && p.color !== piece.color) { // All pawns not of current piece's color
                p.canBeEnPassanted = false;
            }
        }
    }

    // Handle special moves based on moveTypeLogic
    if (moveTypeLogic === 'enPassantEligible') {
        piece.canBeEnPassanted = true;
    }
    if (moveTypeLogic === 'enpassant') {
        const capturedPawnRow = piece.color === PIECE_COLORS.WHITE ? toRowLogic + 1 : toRowLogic - 1;
        const capturedPawn = board[capturedPawnRow][toColLogic]; // Should be the one captured
        if (capturedPawn) { // If it wasn't already handled by attack/removal (it shouldn't be for en passant)
            addCapturedPieceToUI({ ...capturedPawn });

            // Set up its removal animation if not already done (it wouldn't be for en passant typically)
             animationState.removalEffects.push({
                icon: capturedPawn.icon, color: capturedPawn.color,
                row: capturedPawnRow, col: toColLogic,
                durationFrames: 20, maxDuration: 20
            });
            board[capturedPawnRow][toColLogic] = null;
            let baseMessageEnPassant = (gameMessageDisplay.textContent || '').trim();
            if (baseMessageEnPassant && !baseMessageEnPassant.endsWith('.') && !baseMessageEnPassant.endsWith('!')) baseMessageEnPassant += '.';
            gameMessageDisplay.textContent = (baseMessageEnPassant + ` ${piece.type} captures by en passant!`).trim();
        }
    }
    if (moveTypeLogic === 'castle') {
        let side = (toColLogic > fromColLogic) ? 'kingside' : 'queenside';
        const rookStartCol = (side === 'kingside') ? BOARD_SIZE - 1 : 0;
        const rookEndCol = (side === 'kingside') ? toColLogic - 1 : toColLogic + 1;
        const rook = board[toRowLogic][rookStartCol];

        if (rook && rook.type === PIECE_TYPES.ROOK) {
            board[toRowLogic][rookEndCol] = rook;
            board[toRowLogic][rookStartCol] = null;
            rook.col = rookEndCol;
            rook.hasMoved = true;
            let baseMessageCastle = (gameMessageDisplay.textContent || '').trim();
            if (baseMessageCastle && !baseMessageCastle.endsWith('.') && !baseMessageCastle.endsWith('!')) baseMessageCastle += '.';
            gameMessageDisplay.textContent = (baseMessageCastle + ` ${piece.color} castles ${side}.`).trim();
        }
    }

    if (piece.type === PIECE_TYPES.PAWN && (toRowLogic === 0 || toRowLogic === BOARD_SIZE - 1)) {
        if (moveTypeLogic !== 'attack_no_move') {
            const promotedPiece = createPiece(PIECE_TYPES.QUEEN, piece.color, toRowLogic, toColLogic);
            promotedPiece.hasMoved = true;
            board[toRowLogic][toColLogic] = promotedPiece;
            let baseMessagePromo = (gameMessageDisplay.textContent || '').trim();
            if (baseMessagePromo && !baseMessagePromo.endsWith('.') && !baseMessagePromo.endsWith('!')) baseMessagePromo += '.';
            gameMessageDisplay.textContent = (baseMessagePromo + ` Pawn promoted to Queen!`).trim();
        }
    }

    currentPlayer = getOpponentColor(piece.color);

    const kingInCheck = isKingInCheck(currentPlayer);
    let canAnyMove = false;
    for (let r_idx = 0; r_idx < BOARD_SIZE; r_idx++) {
        for (let c_idx = 0; c_idx < BOARD_SIZE; c_idx++) {
            const p = board[r_idx][c_idx];
            if (p && p.color === currentPlayer) {
                if (getLegalMovesForPiece(p, r_idx, c_idx, true).length > 0) {
                    canAnyMove = true;
                    break;
                }
            }
        }
        if (canAnyMove) break;
    }

    let currentMessage = (gameMessageDisplay.textContent || '').trim();

    if (kingInCheck) {
        if (!canAnyMove) {
            endGame(`Checkmate! ${getOpponentColor(currentPlayer)} wins!`);
        } else {
            currentMessage += (currentMessage ? ' ' : '') + `${currentPlayer} is in Check!`;
        }
    } else if (!canAnyMove) {
        endGame("Stalemate! It's a draw.");
    }

    // updateGameStatusDisplay(currentMessage); // This was for pre-animation. finalizeMove sets the final message.
    if (!gameEnded) { // If game not ended by checkmate/stalemate in this function
        gameMessageDisplay.textContent = currentMessage.trim(); // Set the composed message
        currentTurnDisplay.textContent = currentPlayer;
    }
    // If gameEnded, the endGame function has already set the definitive game over message.
}

    function addCapturedPieceToUI(piece) {
        const list = piece.color === PIECE_COLORS.WHITE ? blackCapturedList : whiteCapturedList; // If white piece captured, add to black's list
        const pieceIcon = document.createElement('span');
        pieceIcon.textContent = PIECE_STATS[piece.type].ICON[piece.color] + ' ';
        pieceIcon.title = `${piece.color} ${piece.type}`;
        list.appendChild(pieceIcon);
    }

    // This function is primarily for messages that appear *before* an animation or action completes.
    // Final game state messages are set by finalizeMove or endGame.
    function updateGameStatusDisplay(msg = '') {
        currentTurnDisplay.textContent = currentPlayer; // Keep turn updated
        if (msg) {
            gameMessageDisplay.textContent = msg;
        }
        // Avoid clearing messages here that might be set by finalizeMove if msg is empty.
    }

    function endGame(message) {
        gameMessageDisplay.textContent = message;
        gameEnded = true;
        legalMoves = []; // No more moves
        selectedPiece = null;
        // Optionally, disable board clicks or show a modal
    }

    // --- Event Handling ---
    canvas.addEventListener('click', (event) => {
        if (gameEnded || animationState.isAnimating) return; // Don't process clicks during animation

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / SQUARE_SIZE);
        const row = Math.floor(y / SQUARE_SIZE);

        if (!isValidSquare(row, col)) return;

        const clickedPiece = board[row][col];

        if (selectedPiece) {
            const move = legalMoves.find(m => m.row === row && m.col === col);
            if (move) {
                const pieceToMove = selectedPiece.piece;
                makeMove(pieceToMove, selectedPiece.row, selectedPiece.col, row, col, move.type); // Pass move.type
            } else {
                // Clicked outside legal moves, deselect or select new piece
                selectedPiece = null;
                legalMoves = [];
                if (clickedPiece && clickedPiece.color === currentPlayer) {
                    selectedPiece = { piece: clickedPiece, row, col };
                    legalMoves = getLegalMovesForPiece(clickedPiece, row, col);
                }
                drawGame();
            }
        } else {
            if (clickedPiece && clickedPiece.color === currentPlayer) {
                selectedPiece = { piece: clickedPiece, row, col };
                legalMoves = getLegalMovesForPiece(clickedPiece, row, col);
                drawGame();
            }
        }
    });

    restartButton.addEventListener('click', initializeBoard);

    // --- Start Game ---
    initializeBoard();
});
