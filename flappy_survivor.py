import pygame
import random
import math

# --- Constants ---
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 60
# Colors
WHITE = (255,255,255); BLACK = (0,0,0); RED = (255,0,0); BLUE = (0,0,255); SKY_BLUE = (135,206,235)
YELLOW = (255,255,0); GREEN = (0,255,0); LIGHT_BLUE = (173,216,230); MAGENTA = (200,0,200); GREY = (100,100,100)

# Player properties
GRAVITY = 0.8; FLAP_POWER = -12; PLAYER_HORIZONTAL_FLAP_SPEED = 8
PLAYER_MAX_HP = 100; PLAYER_WIDTH = 50; PLAYER_HEIGHT = 30
# Enemy Properties
DRIFTER_SPEED = 2; DRIFTER_HP = 5; DRIFTER_DAMAGE = 10; DRIFTER_WIDTH=30; DRIFTER_HEIGHT=30
SPIKE_SPEED = 2.5; SPIKE_DASH_SPEED = 12; SPIKE_HP = 8; SPIKE_DAMAGE = 15; SPIKE_WIDTH=25; SPIKE_HEIGHT=25
SPIKE_DASH_COOLDOWN = 4000; SPIKE_DASH_DURATION = 250; SPIKE_DASH_PAUSE_DURATION = 300
CUBE_SENTRY_SPEED = 0.5; CUBE_SENTRY_HP = 15; CUBE_SENTRY_DAMAGE_ON_TOUCH = 5; CUBE_SENTRY_WIDTH=40; CUBE_SENTRY_HEIGHT=40
CUBE_SENTRY_SHOOT_COOLDOWN = 3500; CUBE_SENTRY_PROJECTILE_SPEED = 4; CUBE_SENTRY_PROJECTILE_DAMAGE = 8
CUBE_SENTRY_PROJECTILE_SIZE = 10; CUBE_SENTRY_PROJECTILE_COLOR = RED
# Projectile Properties (Peck)
PECK_SPEED = 15; PECK_BASE_DAMAGE = 1; PECK_WIDTH = 10; PECK_HEIGHT = 6; PECK_COLOR = BLACK
# Feather Orbit Properties
FEATHER_BASE_DAMAGE = 3; FEATHER_BASE_COUNT = 0; FEATHER_BASE_RADIUS = 60; FEATHER_BASE_ANGULAR_SPEED = 0.05
# Homing Spirit Properties
HS_BASE_DAMAGE = 4; HS_BASE_SPEED = 3.5; HS_BASE_TURN_RATE = 0.07; HS_BASE_COOLDOWN = 2200
HS_LIFETIME_NO_TARGET = 2500; HS_PROJECTILE_COUNT = 1; HS_WISP_SIZE = 12
# XP Gem Properties
XP_GEM_VALUE = 1; XP_GEM_WIDTH = 12; XP_GEM_HEIGHT = 12; XP_GEM_COLOR = YELLOW

AVAILABLE_UPGRADES = [
    { 'id': 'peck_damage_1', 'name': 'Peck Power+', 'description': 'Increases Peck damage by 2.','type': 'weapon_stat', 'weapon': 'peck', 'stat': 'damage', 'value': 2, 'max_level': 5  },
    { 'id': 'peck_count_1', 'name': 'Multi-Peck+', 'description': 'Fire an additional Peck projectile.','type': 'weapon_stat', 'weapon': 'peck', 'stat': 'projectile_count', 'value': 1, 'max_level': 3 },
    { 'id': 'unlock_feather_orbit', 'name': 'Feather Orbit', 'description': 'Summons 1 orbiting feather.','type': 'unlock_weapon', 'weapon_name': 'feather_orbit', 'max_level': 1  },
    { 'id': 'feather_orbit_add_feather', 'name': 'Extra Feather', 'description': 'Adds another orbiting feather.','type': 'weapon_stat_existing', 'weapon': 'feather_orbit', 'stat': 'count', 'value': 1, 'max_level': 4, 'requires_unlock_id': 'unlock_feather_orbit'  },
    { 'id': 'feather_orbit_damage', 'name': 'Sharper Feathers', 'description': 'Increases feather damage by 2.','type': 'weapon_stat_existing', 'weapon': 'feather_orbit', 'stat': 'damage', 'value': 2, 'max_level': 5, 'requires_unlock_id': 'unlock_feather_orbit' },
    { 'id': 'feather_orbit_radius', 'name': 'Wider Orbit', 'description': 'Increases orbit radius by 15.','type': 'weapon_stat_existing', 'weapon': 'feather_orbit', 'stat': 'radius', 'value': 15, 'max_level': 3, 'requires_unlock_id': 'unlock_feather_orbit' },
    { 'id': 'unlock_homing_spirit', 'name': 'Homing Spirit', 'description': 'Fires a wisp that seeks enemies.','type': 'unlock_weapon', 'weapon_name': 'homing_spirit', 'max_level': 1 },
    { 'id': 'homing_spirit_damage', 'name': 'Spirit Power+', 'description': 'Increases Homing Spirit damage by 2.','type': 'weapon_stat_existing', 'weapon': 'homing_spirit', 'stat': 'damage', 'value': 2, 'max_level': 5, 'requires_unlock_id': 'unlock_homing_spirit' },
    { 'id': 'homing_spirit_speed', 'name': 'Swift Spirit', 'description': 'Increases Homing Spirit speed by 0.5.','type': 'weapon_stat_existing', 'weapon': 'homing_spirit', 'stat': 'speed', 'value': 0.5, 'max_level': 4, 'requires_unlock_id': 'unlock_homing_spirit' },
    { 'id': 'homing_spirit_count', 'name': 'Spirit Swarm', 'description': 'Fires an additional Homing Spirit.','type': 'weapon_stat_existing', 'weapon': 'homing_spirit', 'stat': 'count', 'value': 1, 'max_level': 2, 'requires_unlock_id': 'unlock_homing_spirit' },
    { 'id': 'energy_shield_unlock', 'name': 'Energy Shield', 'description': 'Blocks one hit (30s cooldown).','type': 'passive_ability', 'ability_name': 'energy_shield', 'max_level': 1 },
    { 'id': 'hearty_meal_1', 'name': 'Hearty Meal', 'description': 'Increases Max HP by 20. Heals 20 HP.','type': 'passive_stat', 'stat': 'max_hp', 'value': 20, 'max_level': 5  },
    { 'id': 'lighter_bones_1', 'name': 'Lighter Bones', 'description': 'Reduces gravity effect by 15%.','type': 'passive_stat', 'stat': 'gravity_modifier', 'value': 0.85, 'max_level': 3 },
    { 'id': 'gem_magnet_1', 'name': 'Gem Magnet (Placeholder)','description': 'Increases XP gem pickup radius (Not Implemented).','type': 'passive_stat', 'stat': 'pickup_radius', 'value': 50, 'max_level': 3 }
]

class HomingWisp(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self, x, y, damage, speed, turn_rate, enemies_group_ref, player_facing_direction):
        super().__init__(); self.image = pygame.Surface((HS_WISP_SIZE,HS_WISP_SIZE),pygame.SRCALPHA)
        pygame.draw.circle(self.image,LIGHT_BLUE,(HS_WISP_SIZE//2,HS_WISP_SIZE//2),HS_WISP_SIZE//2)
        pygame.draw.circle(self.image,WHITE,(HS_WISP_SIZE//2,HS_WISP_SIZE//2),HS_WISP_SIZE//3)
        self.rect = self.image.get_rect(center=(x,y)); self.damage=damage; self.speed=speed; self.turn_rate=turn_rate
        self.enemies_group=enemies_group_ref; self.target_enemy=None; self.time_target_lost=0; self.pos=pygame.math.Vector2(x,y)
        self.velocity=pygame.math.Vector2(player_facing_direction*self.speed*0.5,random.uniform(-0.5,0.5)*self.speed*0.5)
        if self.velocity.length_squared()==0: self.velocity.x=player_facing_direction*0.1
        self.velocity=self.velocity.normalize()*self.speed
    def find_target(self):
        closest_enemy=None; min_dist_sq=float('inf')
        if not self.enemies_group:return
        for enemy in self.enemies_group:
            dist_sq=(enemy.rect.centerx-self.pos.x)**2+(enemy.rect.centery-self.pos.y)**2
            if dist_sq<min_dist_sq:min_dist_sq=dist_sq;closest_enemy=enemy
        self.target_enemy=closest_enemy
    def update(self):
        current_time=pygame.time.get_ticks()
        if self.target_enemy is None or not self.target_enemy.alive():
            if self.time_target_lost==0:self.time_target_lost=current_time
            self.find_target()
            if self.target_enemy is None:
                if current_time-self.time_target_lost>HS_LIFETIME_NO_TARGET:self.kill();return
            else:self.time_target_lost=0
        if self.target_enemy:
            direction_to_target=pygame.math.Vector2(self.target_enemy.rect.center)-self.pos
            if direction_to_target.length_squared()>0:
                target_velocity=direction_to_target.normalize()*self.speed
                self.velocity=self.velocity.lerp(target_velocity,self.turn_rate)
                if self.velocity.length_squared()==0:self.velocity=target_velocity if target_velocity.length_squared()>0 else pygame.math.Vector2(1,0)*self.speed
                self.velocity=self.velocity.normalize()*self.speed
        self.pos+=self.velocity;self.rect.center=self.pos
        if not pygame.Rect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT).colliderect(self.rect.inflate(50,50)):self.kill()

class OrbitalFeather(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self,player_ref,initial_angle_offset):
        super().__init__();self.player_ref=player_ref;self.angle_offset=initial_angle_offset;self.current_absolute_angle=0
        self.image_orig=pygame.Surface((20,8),pygame.SRCALPHA);pygame.draw.ellipse(self.image_orig,WHITE,self.image_orig.get_rect())
        self.image=self.image_orig.copy();self.rect=self.image.get_rect();self.update_visual_properties()
    def update_visual_properties(self):
        self.current_absolute_angle=self.player_ref.feather_current_orbit_angle+self.angle_offset
        self.rect.centerx=self.player_ref.rect.centerx+math.cos(self.current_absolute_angle)*self.player_ref.feather_orbit_radius
        self.rect.centery=self.player_ref.rect.centery+math.sin(self.current_absolute_angle)*self.player_ref.feather_orbit_radius
        degrees=-math.degrees(self.current_absolute_angle);self.image=pygame.transform.rotate(self.image_orig,degrees)
        self.rect=self.image.get_rect(center=self.rect.center)
    def update(self):self.update_visual_properties()

class XPGem(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self,center_pos,xp_value):super().__init__();self.image=pygame.Surface([XP_GEM_WIDTH,XP_GEM_HEIGHT]);self.image.fill(XP_GEM_COLOR);self.rect=self.image.get_rect();self.rect.center=center_pos;self.xp_value=xp_value

class UpgradeCard: # ... (no changes)
    def __init__(self,x,y,width,height,upgrade_data,title_font,desc_font):
        self.rect=pygame.Rect(x,y,width,height);self.upgrade_data=upgrade_data;self.title_font=title_font;self.desc_font=desc_font;self.is_hovered=False
        self.bg_color=(40,40,60);self.hover_bg_color=(70,70,90);self.border_color=WHITE;self.title_color=YELLOW;self.desc_color=WHITE;self.padding=15
    def draw(self,surface):
        current_bg_color=self.hover_bg_color if self.is_hovered else self.bg_color;pygame.draw.rect(surface,current_bg_color,self.rect,border_radius=5);pygame.draw.rect(surface,self.border_color,self.rect,2,border_radius=5)
        title_surface=self.title_font.render(self.upgrade_data['name'],True,self.title_color);title_pos_x=self.rect.x+self.padding;title_pos_y=self.rect.y+self.padding;surface.blit(title_surface,(title_pos_x,title_pos_y))
        desc_text=self.upgrade_data['description'];max_desc_width=self.rect.width-2*self.padding;words=desc_text.split(' ');lines=[];current_line_text=""
        for word in words:test_line_text=current_line_text+word+" "; \
                         if self.desc_font.size(test_line_text)[0]<=max_desc_width:current_line_text=test_line_text
                         else:lines.append(current_line_text.strip());current_line_text=word+" "
        lines.append(current_line_text.strip());desc_pos_y_start=title_pos_y+title_surface.get_height()+7
        for i,line_text in enumerate(lines):
            if line_text:line_surface=self.desc_font.render(line_text,True,self.desc_color);desc_pos_y=desc_pos_y_start+i*(self.desc_font.get_height()+2);surface.blit(line_surface,(title_pos_x,desc_pos_y))
    def is_clicked(self,pos):return self.rect.collidepoint(pos)
    def update_hover(self,mouse_pos):self.is_hovered=self.rect.collidepoint(mouse_pos)

class Projectile(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self,x,y,direction_x,direction_y,speed,damage,width,height,color):super().__init__();self.image=pygame.Surface([width,height]);self.image.fill(color);self.rect=self.image.get_rect(center=(x,y));self.direction_x=direction_x;self.direction_y=direction_y;self.speed=speed;self.damage=damage
    def update(self):self.rect.x+=self.direction_x*self.speed;self.rect.y+=self.direction_y*self.speed; \
                   if not pygame.Rect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT).colliderect(self.rect):self.kill()

class Enemy(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self,x,y,width,height,color,speed,health,damage_on_touch):super().__init__();self.image=pygame.Surface([width,height]);self.image.fill(color);self.rect=self.image.get_rect(topleft=(x,y));self.speed=speed;self.current_health=health;self.max_health=health;self.damage_on_touch=damage_on_touch
    def update(self,player_rect):dx=player_rect.centerx-self.rect.centerx;dy=player_rect.centery-self.rect.centery;dist=max(1,math.hypot(dx,dy));self.rect.x+=(dx/dist)*self.speed;self.rect.y+=(dy/dist)*self.speed
    def take_damage(self,amount):self.current_health-=amount; \
                                if self.current_health<=0:self.kill();return True
                                return False

class Drifter(Enemy): # ... (no changes)
    def __init__(self,x,y,player_rect):super().__init__(x,y,DRIFTER_WIDTH,DRIFTER_HEIGHT,BLUE,DRIFTER_SPEED,DRIFTER_HP,DRIFTER_DAMAGE)

class Spike(Enemy): # ... (no changes)
    def __init__(self,x,y,player_rect):super().__init__(x,y,SPIKE_WIDTH,SPIKE_HEIGHT,MAGENTA,SPIKE_SPEED,SPIKE_HP,SPIKE_DAMAGE);self.is_dashing=False;self.dash_target_pos=None;self.last_dash_attempt_time=pygame.time.get_ticks()+random.randint(0,SPIKE_DASH_COOLDOWN);self.dash_start_time=0;self.pause_before_dash_start_time=0;self.is_pausing_before_dash=False;self.original_speed=SPIKE_SPEED
    def update(self,player_rect):
        current_time=pygame.time.get_ticks()
        if self.is_dashing:
            if current_time-self.dash_start_time>SPIKE_DASH_DURATION:self.is_dashing=False;self.speed=self.original_speed;self.last_dash_attempt_time=current_time
            else:
                if self.dash_target_pos:dx=self.dash_target_pos[0]-self.rect.centerx;dy=self.dash_target_pos[1]-self.rect.centery;dist=max(1,math.hypot(dx,dy));self.rect.x+=(dx/dist)*self.speed;self.rect.y+=(dy/dist)*self.speed
                return
        elif self.is_pausing_before_dash:
            if current_time-self.pause_before_dash_start_time>SPIKE_DASH_PAUSE_DURATION:self.is_pausing_before_dash=False;self.is_dashing=True;self.dash_start_time=current_time;self.speed=SPIKE_DASH_SPEED
            return
        else:
            super().update(player_rect)
            if current_time-self.last_dash_attempt_time>SPIKE_DASH_COOLDOWN:self.is_pausing_before_dash=True;self.pause_before_dash_start_time=current_time;self.dash_target_pos=player_rect.center

class EnemyProjectile(pygame.sprite.Sprite): # ... (no changes)
    def __init__(self,x,y,target_x,target_y,speed,damage,size,color):super().__init__();self.image=pygame.Surface((size,size));self.image.fill(color);self.rect=self.image.get_rect(center=(x,y));self.damage=damage;self.speed=speed;direction=pygame.math.Vector2(target_x-x,target_y-y);self.velocity=direction.normalize()*speed if direction.length_squared()>0 else pygame.math.Vector2(0,-speed)
    def update(self):self.rect.x+=self.velocity.x;self.rect.y+=self.velocity.y; \
                   if not pygame.Rect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT).colliderect(self.rect.inflate(20,20)):self.kill()

class CubeSentry(Enemy): # ... (no changes)
    def __init__(self,x,y,player_rect):super().__init__(x,y,CUBE_SENTRY_WIDTH,CUBE_SENTRY_HEIGHT,GREY,CUBE_SENTRY_SPEED,CUBE_SENTRY_HP,CUBE_SENTRY_DAMAGE_ON_TOUCH);self.last_shot_time=pygame.time.get_ticks()+random.randint(0,CUBE_SENTRY_SHOOT_COOLDOWN);self.is_stationary_shooter=True
    def update(self,player_rect,enemy_projectiles_group,all_sprites_ref):
        if not self.is_stationary_shooter:super().update(player_rect)
        current_time=pygame.time.get_ticks()
        if current_time-self.last_shot_time>CUBE_SENTRY_SHOOT_COOLDOWN:self.last_shot_time=current_time;proj=EnemyProjectile(self.rect.centerx,self.rect.centery,player_rect.centerx,player_rect.centery,CUBE_SENTRY_PROJECTILE_SPEED,CUBE_SENTRY_PROJECTILE_DAMAGE,CUBE_SENTRY_PROJECTILE_SIZE,CUBE_SENTRY_PROJECTILE_COLOR); \
                                                                     if enemy_projectiles_group is not None:enemy_projectiles_group.add(proj)
                                                                     if all_sprites_ref is not None:all_sprites_ref.add(proj)

class GameDirector:
    def __init__(self, player_ref, enemies_group_ref, enemy_projectiles_group_ref, all_sprites_ref):
        self.player_ref = player_ref
        self.enemies_group = enemies_group_ref
        self.enemy_projectiles_group = enemy_projectiles_group_ref # For CubeSentry to shoot
        self.all_sprites = all_sprites_ref
        self.game_start_time = pygame.time.get_ticks()

        # Timers for spawning different enemies
        self.last_drifter_spawn = 0
        self.drifter_interval = 3000 # Start with 3s interval
        self.last_spike_spawn = 0
        self.spike_interval = 5000
        self.last_sentry_spawn = 0
        self.sentry_interval = 8000

        self.wave_number = 0 # Could be used for difficulty scaling

    def spawn_enemy_at_random_edge(self, enemy_class, *args):
        edge = random.choice(['top', 'bottom', 'left', 'right'])
        x, y = 0, 0
        # Assuming enemy_class takes (x, y, player_rect_for_initial_targeting_if_needed)
        # We need to get width/height from the class or instance, this is a bit tricky without instantiation
        # For now, assume a generic offset or use constants if available
        temp_enemy_for_size = enemy_class(0,0, self.player_ref.rect) # Temporary for size, not added
        e_width, e_height = temp_enemy_for_size.rect.width, temp_enemy_for_size.rect.height
        temp_enemy_for_size.kill() # Remove immediately

        if edge == 'top': x,y = random.randint(0,SCREEN_WIDTH-e_width), 0-e_height
        elif edge == 'bottom': x,y = random.randint(0,SCREEN_WIDTH-e_width), SCREEN_HEIGHT
        elif edge == 'left': x,y = 0-e_width, random.randint(0,SCREEN_HEIGHT-e_height)
        elif edge == 'right': x,y = SCREEN_WIDTH, random.randint(0,SCREEN_HEIGHT-e_height)

        new_enemy = enemy_class(x, y, self.player_ref.rect)
        self.enemies_group.add(new_enemy)
        self.all_sprites.add(new_enemy)

    def update(self):
        current_game_time_ms = pygame.time.get_ticks() - self.game_start_time
        current_time_ticks = pygame.time.get_ticks() # For interval checks

        # --- Drifter Spawning ---
        if current_time_ticks - self.last_drifter_spawn > self.drifter_interval:
            self.last_drifter_spawn = current_time_ticks
            self.spawn_enemy_at_random_edge(Drifter)
            # Optional: Decrease drifter_interval over time for more drifters
            if self.drifter_interval > 1000 and current_game_time_ms > 20000: # After 20s
                 self.drifter_interval = max(1000, self.drifter_interval - 100)


        # --- Spike Spawning (Starts after 20 seconds) ---
        if current_game_time_ms > 20000: # Start spawning Spikes after 20s
            if current_time_ticks - self.last_spike_spawn > self.spike_interval:
                self.last_spike_spawn = current_time_ticks
                self.spawn_enemy_at_random_edge(Spike)
                if self.spike_interval > 2500 and current_game_time_ms > 45000: # After 45s
                    self.spike_interval = max(2500, self.spike_interval - 150)

        # --- Cube Sentry Spawning (Starts after 40 seconds) ---
        if current_game_time_ms > 40000: # Start spawning Cube Sentries after 40s
            if current_time_ticks - self.last_sentry_spawn > self.sentry_interval:
                self.last_sentry_spawn = current_time_ticks
                self.spawn_enemy_at_random_edge(CubeSentry)
                if self.sentry_interval > 5000 and current_game_time_ms > 70000: # After 70s
                    self.sentry_interval = max(5000, self.sentry_interval - 200)


class Player(pygame.sprite.Sprite): # ... (no changes to Player for GameDirector specifically beyond what's there)
    def __init__(self):
        super().__init__()
        self.image_orig_right = pygame.Surface([PLAYER_WIDTH, PLAYER_HEIGHT]); self.image_orig_right.fill(RED)
        self.image_orig_left = pygame.transform.flip(self.image_orig_right, True, False)
        self.image = self.image_orig_right
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 100))
        self.velocity_y = 0; self.velocity_x = 0; self.facing_direction = 1
        self.max_hp = PLAYER_MAX_HP; self.health = self.max_hp
        self.current_xp = 0; self.level = 1; self.xp_to_next_level = 10
        self.taken_upgrade_levels = {}
        self.peck_base_damage = PECK_BASE_DAMAGE; self.peck_current_damage = self.peck_base_damage
        self.peck_projectile_count = 1; self.gravity_modifier = 1.0; self.pickup_radius = 40
        self.projectiles = pygame.sprite.Group(); self.peck_cooldown = 500; self.last_peck_time = 0
        self.has_energy_shield = False; self.energy_shield_active = False
        self.energy_shield_cooldown_time = 30000; self.energy_shield_recharge_start_time = 0
        self.shield_visual_alpha = 0
        self.feather_orbit_active = False; self.feather_orbit_level = 0
        self.feather_count = FEATHER_BASE_COUNT; self.feather_current_damage = FEATHER_BASE_DAMAGE
        self.feather_orbit_radius = FEATHER_BASE_RADIUS; self.feather_angular_speed = FEATHER_BASE_ANGULAR_SPEED
        self.feather_current_orbit_angle = 0; self.orbiting_feathers = pygame.sprite.Group()
        self.homing_spirit_active = False; self.homing_spirit_level = 0
        self.homing_spirit_current_damage = HS_BASE_DAMAGE; self.homing_spirit_speed = HS_BASE_SPEED
        self.homing_spirit_turn_rate = HS_BASE_TURN_RATE; self.homing_spirit_cooldown = HS_BASE_COOLDOWN
        self.last_homing_spirit_fire_time = 0; self.homing_spirit_count = HS_PROJECTILE_COUNT
        self.homing_wisps = pygame.sprite.Group()
        self.all_sprites_ref = None; self.enemies_group_ref = None
    def set_sprite_refs(self,all_sprites_group,enemies_group):self.all_sprites_ref=all_sprites_group;self.enemies_group_ref=enemies_group
    def update_feather_orbit_feathers(self):
        if not self.feather_orbit_active or self.all_sprites_ref is None:return
        for feather in self.orbiting_feathers:feather.kill()
        self.orbiting_feathers.empty()
        angle_increment=(2*math.pi)/self.feather_count if self.feather_count>0 else 0
        for i in range(self.feather_count):angle_offset=i*angle_increment;feather=OrbitalFeather(self,angle_offset);self.orbiting_feathers.add(feather);self.all_sprites_ref.add(feather)
    def shoot_peck(self):
        if self.all_sprites_ref is None:return
        spawn_offset_x=(PLAYER_WIDTH//2)+(PECK_WIDTH//2)+5;spawn_x=self.rect.centerx+(self.facing_direction*spawn_offset_x);spawn_y=self.rect.centery
        for _ in range(self.peck_projectile_count):peck=Projectile(spawn_x,spawn_y,self.facing_direction,0,PECK_SPEED,self.peck_current_damage,PECK_WIDTH,PECK_HEIGHT,PECK_COLOR);self.projectiles.add(peck);self.all_sprites_ref.add(peck)
    def shoot_homing_spirit(self):
        if self.all_sprites_ref is None or self.enemies_group_ref is None:return
        spawn_x=self.rect.centerx;spawn_y=self.rect.centery
        for _ in range(self.homing_spirit_count):wisp=HomingWisp(spawn_x,spawn_y,self.homing_spirit_current_damage,self.homing_spirit_speed,self.homing_spirit_turn_rate,self.enemies_group_ref,self.facing_direction);self.homing_wisps.add(wisp);self.all_sprites_ref.add(wisp)
    def check_level_up(self):
        if self.current_xp>=self.xp_to_next_level:self.level+=1;self.current_xp-=self.xp_to_next_level;self.xp_to_next_level=int(self.xp_to_next_level*1.5);return True
        return False
    def take_damage(self,amount):
        if self.has_energy_shield and self.energy_shield_active:self.energy_shield_active=False;self.energy_shield_recharge_start_time=pygame.time.get_ticks();self.shield_visual_alpha=0;return
        self.health-=amount;if self.health<0:self.health=0
    def heal(self,amount):self.health+=amount;if self.health>self.max_hp:self.health=self.max_hp
    def flap(self):self.velocity_y=FLAP_POWER;self.velocity_x=PLAYER_HORIZONTAL_FLAP_SPEED*self.facing_direction
    def turn_left(self):self.facing_direction=-1;self.image=self.image_orig_left
    def turn_right(self):self.facing_direction=1;self.image=self.image_orig_right
    def update(self):
        current_ticks=pygame.time.get_ticks()
        if current_ticks-self.last_peck_time>self.peck_cooldown:self.shoot_peck();self.last_peck_time=current_ticks
        if self.homing_spirit_active and current_ticks-self.last_homing_spirit_fire_time>self.homing_spirit_cooldown:self.shoot_homing_spirit();self.last_homing_spirit_fire_time=current_ticks
        if self.feather_orbit_active:self.feather_current_orbit_angle+=self.feather_angular_speed; \
                                    if self.feather_current_orbit_angle>2*math.pi:self.feather_current_orbit_angle-=2*math.pi
        self.velocity_y+=(GRAVITY*self.gravity_modifier);self.rect.y+=self.velocity_y;self.rect.x+=self.velocity_x;self.velocity_x*=0.8
        if abs(self.velocity_x)<0.5:self.velocity_x=0
        if self.rect.top<0:self.rect.top=0;self.velocity_y=0
        if self.rect.bottom>SCREEN_HEIGHT:self.rect.bottom=SCREEN_HEIGHT;self.velocity_y=0
        if self.rect.left<0:self.rect.left=0;self.velocity_x=0
        if self.rect.right>SCREEN_WIDTH:self.rect.right=SCREEN_WIDTH;self.velocity_x=0
        if self.has_energy_shield and not self.energy_shield_active:
            if current_ticks-self.energy_shield_recharge_start_time>self.energy_shield_cooldown_time:self.energy_shield_active=True;self.shield_visual_alpha=128
        if self.energy_shield_active and self.shield_visual_alpha<128:self.shield_visual_alpha=min(128,self.shield_visual_alpha+15)
        elif not self.energy_shield_active and self.shield_visual_alpha>0:self.shield_visual_alpha=max(0,self.shield_visual_alpha-15)

def apply_upgrade(player,upgrade_data): # ... (no changes)
    upgrade_id=upgrade_data['id'];player.taken_upgrade_levels[upgrade_id]=player.taken_upgrade_levels.get(upgrade_id,0)+1
    if upgrade_data['type']=='weapon_stat':
        if upgrade_data['weapon']=='peck':
            if upgrade_data['stat']=='damage':player.peck_current_damage+=upgrade_data['value']
            elif upgrade_data['stat']=='projectile_count':player.peck_projectile_count+=upgrade_data['value']
    elif upgrade_data['type']=='unlock_weapon':
        if upgrade_data['weapon_name']=='feather_orbit':player.feather_orbit_active=True;player.feather_count=1;player.update_feather_orbit_feathers()
        elif upgrade_data['weapon_name']=='homing_spirit':player.homing_spirit_active=True
    elif upgrade_data['type']=='weapon_stat_existing':
        if upgrade_data['weapon']=='feather_orbit':
            if upgrade_data['stat']=='count':player.feather_count+=upgrade_data['value']
            elif upgrade_data['stat']=='damage':player.feather_current_damage+=upgrade_data['value']
            elif upgrade_data['stat']=='radius':player.feather_orbit_radius+=upgrade_data['value']
            player.update_feather_orbit_feathers()
        elif upgrade_data['weapon']=='homing_spirit':
            if upgrade_data['stat']=='damage':player.homing_spirit_current_damage+=upgrade_data['value']
            elif upgrade_data['stat']=='speed':player.homing_spirit_speed+=upgrade_data['value']
            elif upgrade_data['stat']=='count':player.homing_spirit_count+=upgrade_data['value']
    elif upgrade_data['type']=='passive_stat':
        if upgrade_data['stat']=='max_hp':player.max_hp+=upgrade_data['value'];player.heal(upgrade_data['value'])
        elif upgrade_data['stat']=='gravity_modifier':player.gravity_modifier*=upgrade_data['value']
        elif upgrade_data['stat']=='pickup_radius':player.pickup_radius+=upgrade_data['value']
    elif upgrade_data['type']=='passive_ability':
        if upgrade_data['ability_name']=='energy_shield':player.has_energy_shield=True;player.energy_shield_active=True;player.shield_visual_alpha=128

def main():
    pygame.init();pygame.font.init();screen=pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT));pygame.display.set_caption("Flappy Survivor - Milestone 5");clock=pygame.time.Clock()
    UI_FONT_SIZE=20;ui_font=pygame.font.SysFont("arial",UI_FONT_SIZE);LEVEL_UP_MSG_FONT_SIZE=48;level_up_msg_font=pygame.font.SysFont("arial",LEVEL_UP_MSG_FONT_SIZE,bold=True);CARD_TITLE_FONT_SIZE=22;card_title_font=pygame.font.SysFont("arial",CARD_TITLE_FONT_SIZE,bold=True);CARD_DESC_FONT_SIZE=16;card_desc_font=pygame.font.SysFont("arial",CARD_DESC_FONT_SIZE)
    player=Player();all_sprites=pygame.sprite.Group();all_sprites.add(player);enemies=pygame.sprite.Group()
    player.set_sprite_refs(all_sprites,enemies)
    xp_gems=pygame.sprite.Group()
    enemy_projectiles = pygame.sprite.Group() # For Cube Sentry projectiles

    game_director = GameDirector(player, enemies, enemy_projectiles, all_sprites) # Initialize GameDirector

    game_paused_for_level_up=False;current_upgrade_choices=[];displayed_upgrade_cards=[]

    game_over_or_won_paused = False # New flag for win/loss state
    game_won = False
    game_lost = False
    TARGET_SURVIVAL_TIME_MS = 15 * 60 * 1000 # 15 minutes in milliseconds
    # TARGET_SURVIVAL_TIME_MS = 30 * 1000 # Quick test: 30 seconds

    running=True
    while running:
        current_ticks=pygame.time.get_ticks();mouse_pos=pygame.mouse.get_pos()
        for event in pygame.event.get():
            if event.type==pygame.QUIT:running=False
            if game_paused_for_level_up:
                if event.type==pygame.MOUSEBUTTONDOWN and event.button==1:
                    for card in displayed_upgrade_cards:
                        if card.is_clicked(mouse_pos):apply_upgrade(player,card.upgrade_data);game_paused_for_level_up=False;displayed_upgrade_cards=[];current_upgrade_choices=[];break
            else:
                if event.type==pygame.KEYDOWN:
                    if event.key==pygame.K_SPACE:player.flap()
                    if event.key==pygame.K_a:player.turn_left()
                    if event.key==pygame.K_d:player.turn_right()
                if event.type==pygame.MOUSEBUTTONDOWN and event.button==1:player.flap()
            # Allow quit even if game is over/won
            elif event.type == pygame.QUIT: # This was missing, ensure quit works always
                running = False


        # Combine pause checks: if level up OR game over/won, skip updates
        if not game_paused_for_level_up and not game_over_or_won_paused:
            current_game_duration_ms = current_ticks - game_director.game_start_time

            game_director.update()
            player.update()
            for enemy_sprite in enemies:
                if isinstance(enemy_sprite, CubeSentry):
                    enemy_sprite.update(player.rect, enemy_projectiles, all_sprites)
                elif isinstance(enemy_sprite, Spike) or isinstance(enemy_sprite, Drifter): # Spike and Drifter take player_rect
                    enemy_sprite.update(player.rect)
                # else: enemy_sprite.update() # For any other enemy types that might not need args

            player.projectiles.update();player.orbiting_feathers.update();player.homing_wisps.update()
            enemy_projectiles.update() # Update enemy projectiles

            collided_enemies_player=pygame.sprite.spritecollide(player,enemies,False)
            for enemy_hit in collided_enemies_player:player.take_damage(enemy_hit.damage_on_touch); \
                                                    if enemy_hit.take_damage(enemy_hit.max_health):gem=XPGem(enemy_hit.rect.center,XP_GEM_VALUE);all_sprites.add(gem);xp_gems.add(gem)

            # Player Projectile - Enemy Collision (Peck)
            projectile_enemy_hits=pygame.sprite.groupcollide(enemies,player.projectiles,False,True)
            for enemy_hit,projectiles_hit_list in projectile_enemy_hits.items():
                for proj in projectiles_hit_list:
                    if enemy_hit.take_damage(proj.damage):gem=XPGem(enemy_hit.rect.center,XP_GEM_VALUE);all_sprites.add(gem);xp_gems.add(gem)

            # Feather - Enemy Collision
            feather_enemy_hits=pygame.sprite.groupcollide(enemies,player.orbiting_feathers,False,False)
            for enemy_hit,feathers_that_hit_list in feather_enemy_hits.items():
                for _ in feathers_that_hit_list:
                    if enemy_hit.take_damage(player.feather_current_damage):gem=XPGem(enemy_hit.rect.center,XP_GEM_VALUE);all_sprites.add(gem);xp_gems.add(gem)

            # Homing Wisp - Enemy Collision
            wisp_enemy_hits=pygame.sprite.groupcollide(enemies,player.homing_wisps,False,True)
            for enemy_hit,wisps_that_hit_list in wisp_enemy_hits.items():
                for wisp in wisps_that_hit_list:
                     if enemy_hit.take_damage(wisp.damage):gem=XPGem(enemy_hit.rect.center,XP_GEM_VALUE);all_sprites.add(gem);xp_gems.add(gem)

            # Enemy Projectile - Player Collision
            enemy_proj_player_hits = pygame.sprite.spritecollide(player, enemy_projectiles, True) # Kill projectile
            for proj_hit in enemy_proj_player_hits:
                player.take_damage(proj_hit.damage)


            for gem in list(xp_gems):dx=gem.rect.centerx-player.rect.centerx;dy=gem.rect.centery-player.rect.centery; \
                                     if(dx*dx+dy*dy)<(player.pickup_radius*player.pickup_radius):player.current_xp+=gem.xp_value;gem.kill()
            if player.check_level_up():
                game_paused_for_level_up=True;current_upgrade_choices=[]
                possible_choices=[]
                for upg_template in AVAILABLE_UPGRADES:
                    taken_level=player.taken_upgrade_levels.get(upg_template['id'],0);has_prereq=True
                    if 'requires_unlock_id' in upg_template:
                        if player.taken_upgrade_levels.get(upg_template['requires_unlock_id'],0)==0:has_prereq=False
                    if taken_level<upg_template['max_level'] and has_prereq:
                        if upg_template['type']=='unlock_weapon':
                            if player.taken_upgrade_levels.get(upg_template['id'],0)>0:continue
                            if upg_template['weapon_name']=='feather_orbit' and player.feather_orbit_active:continue
                            if upg_template['weapon_name']=='homing_spirit' and player.homing_spirit_active:continue
                        elif upg_template['type']=='passive_ability':
                             if upg_template['ability_name']=='energy_shield' and player.has_energy_shield:continue
                        possible_choices.append(upg_template)
                random.shuffle(possible_choices);current_upgrade_choices=possible_choices[:3];displayed_upgrade_cards=[]
                card_width=SCREEN_WIDTH//3-40;card_height=SCREEN_HEIGHT//2.5;total_cards_width=len(current_upgrade_choices)*card_width+max(0,len(current_upgrade_choices)-1)*30;start_x=(SCREEN_WIDTH-total_cards_width)//2;card_y=SCREEN_HEIGHT//2-card_height//2+30
                for i,choice_data in enumerate(current_upgrade_choices):card_x=start_x+i*(card_width+30);card=UpgradeCard(card_x,card_y,card_width,card_height,choice_data,card_title_font,card_desc_font);displayed_upgrade_cards.append(card)

            # Win Condition
            if not game_won and not game_lost and current_game_duration_ms >= TARGET_SURVIVAL_TIME_MS:
                game_won = True
                game_over_or_won_paused = True
                print("YOU WON!") # Console feedback

            # Loss Condition
            if player.health<=0 and not game_lost and not game_won:
                game_lost = True
                game_over_or_won_paused = True
                print("Game Over!")

        # --- Drawing ---
        screen.fill(SKY_BLUE);all_sprites.draw(screen)
        draw_health_bar(screen,player.health,player.max_hp,10,10,200,20);xp_bar_y=10+20+10;draw_xp_bar(screen,player.current_xp,player.xp_to_next_level,player.level,ui_font,10,xp_bar_y,200,15)

        # Draw Game Timer
        if hasattr(game_director, 'game_start_time'): # Ensure director is initialized
            elapsed_total_seconds = (current_ticks - game_director.game_start_time) // 1000
            timer_minutes = elapsed_total_seconds // 60
            timer_seconds = elapsed_total_seconds % 60
            timer_text = f"{timer_minutes:02}:{timer_seconds:02}"
            timer_surf = ui_font.render(timer_text, True, WHITE)
            screen.blit(timer_surf, (SCREEN_WIDTH - timer_surf.get_width() - 10, 10))

        if player.has_energy_shield and player.shield_visual_alpha>0:
            shield_surface=pygame.Surface((player.rect.width+20,player.rect.height+20),pygame.SRCALPHA);pygame.draw.circle(shield_surface,(100,100,255,player.shield_visual_alpha),shield_surface.get_rect().center,player.rect.width//2+10,3);screen.blit(shield_surface,(player.rect.centerx-shield_surface.get_width()//2,player.rect.centery-shield_surface.get_height()//2))

        if game_paused_for_level_up and not game_over_or_won_paused : # Only show level up if game not over/won
            overlay=pygame.Surface((SCREEN_WIDTH,SCREEN_HEIGHT),pygame.SRCALPHA);overlay.fill((0,0,0,200));screen.blit(overlay,(0,0))
            level_up_text_surf=level_up_msg_font.render("LEVEL UP!",True,YELLOW);screen.blit(level_up_text_surf,(SCREEN_WIDTH//2-level_up_text_surf.get_width()//2,SCREEN_HEIGHT//7))
            for card in displayed_upgrade_cards:card.update_hover(mouse_pos);card.draw(screen)

        elif game_over_or_won_paused:
            overlay=pygame.Surface((SCREEN_WIDTH,SCREEN_HEIGHT),pygame.SRCALPHA);overlay.fill((0,0,0,220));screen.blit(overlay,(0,0))
            final_message = ""
            if game_won: final_message = "YOU WON!"
            elif game_lost: final_message = "GAME OVER"

            msg_surf = level_up_msg_font.render(final_message, True, YELLOW if game_won else RED)
            screen.blit(msg_surf, (SCREEN_WIDTH//2 - msg_surf.get_width()//2, SCREEN_HEIGHT//3))

            final_time_text = f"Time Survived: {timer_minutes:02}:{timer_seconds:02}"
            time_surf = ui_font.render(final_time_text, True, WHITE)
            screen.blit(time_surf, (SCREEN_WIDTH//2 - time_surf.get_width()//2, SCREEN_HEIGHT//2))

            # For now, game exits on QUIT event. No explicit restart.

        pygame.display.flip();clock.tick(FPS)
    pygame.quit()

def draw_health_bar(surface,current_hp,max_hp,x,y,width,height): # ... (no changes)
    if current_hp<0:current_hp=0
    fill_pct=current_hp/max_hp if max_hp>0 else 0;fill_width=width*fill_pct;outline_rect=pygame.Rect(x,y,width,height);fill_rect=pygame.Rect(x,y,fill_width,height);pygame.draw.rect(surface,(100,0,0),outline_rect);pygame.draw.rect(surface,RED,fill_rect);pygame.draw.rect(surface,WHITE,outline_rect,2)
def draw_xp_bar(surface,current_xp,xp_to_next_level,level,font,x,y,width,height): # ... (no changes)
    fill_pct=current_xp/xp_to_next_level if xp_to_next_level>0 else 0;fill_width=width*fill_pct;outline_rect=pygame.Rect(x,y,width,height);fill_rect=pygame.Rect(x,y,fill_width,height);pygame.draw.rect(surface,(50,50,50),outline_rect);pygame.draw.rect(surface,YELLOW,fill_rect);pygame.draw.rect(surface,WHITE,outline_rect,2);level_text_surface=font.render(f"Lvl: {level}",True,WHITE);text_x=x+width+10;text_y=y+(height-level_text_surface.get_height())//2;surface.blit(level_text_surface,(text_x,text_y))

if __name__=="__main__":main()
