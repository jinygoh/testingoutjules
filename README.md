# Flappy Survivor v2.0

Flappy Survivor is a 2D survival roguelite game that merges the progression system of Vampire Survivors with a unique, physics-based movement mechanic inspired by Flappy Bird. Control a chibi bird, survive against waves of enemies, collect XP, level up, and choose powerful upgrades to make it through 15 minutes of escalating chaos!

## Setup Instructions

1.  **Ensure Python is Installed:**
    *   You'll need Python 3 installed on your system. You can download it from [python.org](https://python.org).

2.  **Install Pygame:**
    *   This game uses the Pygame library. If you don't have it installed, open a terminal or command prompt and run:
        ```bash
        pip install pygame
        ```

3.  **Get the Game File:**
    *   Make sure the Python script (`flappy_survivor.py`) is saved to a directory on your computer.

4.  **Run the Game:**
    *   Open a terminal or command prompt.
    *   Navigate (`cd`) to the directory where you saved `flappy_survivor.py`.
    *   Run the game using:
        ```bash
        python flappy_survivor.py
        ```

## How to Play

*   **Objective:** Survive for 15 minutes against increasingly difficult waves of enemies.

*   **Movement:**
    *   **Turn Left:** Press the `A` key.
    *   **Turn Right:** Press the `D` key.
    *   **Flap:** Press the `Spacebar` or `Left Mouse Click`. Flapping propels your bird upwards and in the direction it is currently facing. Gravity will constantly pull you down. Master the arc!

*   **Combat:**
    *   Your equipped weapons fire automatically. Your primary job is skillful movement, positioning, and collecting items.
    *   Avoid direct contact with enemies, as this will reduce your health.
    *   Some enemies (like Cube Sentries) will fire projectiles. Dodge them!

*   **Experience and Leveling:**
    *   Defeated enemies drop yellow XP gems.
    *   Fly into the gems to collect them. This fills your XP bar, located below your health bar at the top-left of the screen.
    *   When the XP bar is full, you will **Level Up!**

*   **Upgrades:**
    *   Upon leveling up, the game will pause, and you'll be presented with three upgrade cards.
    *   Use your mouse to hover over the cards to read their names and descriptions.
    *   **Click on a card** to select that upgrade. The game will then unpause.
    *   Upgrades can include:
        *   New weapons (like Feather Orbit or Homing Spirit).
        *   Improvements to your existing weapons (more damage, more projectiles).
        *   Passive benefits (increased max health, a temporary shield, reduced gravity).

*   **Winning and Losing:**
    *   **Win Condition:** Survive for the full 15 minutes. A "YOU WON!" screen will appear.
    *   **Loss Condition:** If your health (the red bar at the top-left) drops to zero, the game is over, and a "GAME OVER" screen will be displayed.
    *   The game timer is shown in the top-right corner (MM:SS).

## Tips for Survival

*   **Movement is Key:** Practice the flap mechanic. Smooth, controlled arcs will help you dodge and position effectively.
*   **Situational Awareness:** Keep an eye on all parts of the screen for incoming enemies and projectiles.
*   **Strategic Upgrades:** Think about what upgrades will best help you deal with the current and upcoming threats. Sometimes a defensive upgrade is better than pure offense!

Good luck, and enjoy Flappy Survivor!
