const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const W = canvas.width
const H = canvas.height

function rand(a,b){
return Math.random()*(b-a)+a
}

class Character{

constructor(x,y,type,player=false){

this.x=x
this.y=y

this.type=type
this.player=player

this.radius=20

this.reload=3
this.maxReload=3

this.hp=100
this.maxHp=100

this.ult=0

this.lastHit=0

this.speed=2

if(type=="tank"){
this.hp=160
this.maxHp=160
this.speed=1.5
}

if(type=="sniper"){
this.hp=80
this.maxHp=80
}

if(type=="speed"){
this.speed=3
}

}

draw(){

ctx.fillStyle = this.player ? "#00ff88" : "#ff5555"

ctx.beginPath()
ctx.arc(this.x,this.y,20,0,Math.PI*2)
ctx.fill()

ctx.fillStyle="white"
ctx.fillText(Math.floor(this.hp),this.x-10,this.y-25)

}

update(){

if(Date.now()-this.lastHit>3000){
this.hp=Math.min(this.maxHp,this.hp+0.1)
}

if(this.reload<this.maxReload){
this.reload+=0.02
}

}

}

class Bullet{

constructor(x,y,dx,dy,damage,owner){

this.x=x
this.y=y

this.dx=dx
this.dy=dy

this.damage=damage
this.owner=owner

}

update(){

this.x+=this.dx
this.y+=this.dy

}

draw(){

ctx.fillStyle="yellow"

ctx.beginPath()
ctx.arc(this.x,this.y,5,0,Math.PI*2)
ctx.fill()

}

}

const walls=[

{x:200,y:200,w:200,h:40},
{x:500,y:100,w:40,h:200},
{x:600,y:350,w:200,h:40}

]

function collideWall(x,y){

for(let w of walls){

if(x>w.x&&x<w.x+w.w&&y>w.y&&y<w.y+w.h)
return true

}

return false
}

function spawn(){

while(true){

let x=rand(50,W-50)
let y=rand(50,H-50)

if(!collideWall(x,y))
return {x,y}

}

}

const player = new Character(300,300,"speed",true)

const bots=[]

for(let i=0;i<5;i++){

let p=spawn()

bots.push(new Character(p.x,p.y,"tank"))

}

const bullets=[]

function nearestEnemy(me){

let min=9999
let target=null

for(let b of bots){

let d=Math.hypot(b.x-me.x,b.y-me.y)

if(d<min){
min=d
target=b
}

}

return target

}

function shoot(char){

if(char.reload<1)return

let target=nearestEnemy(char)

if(!target)return

let dx=target.x-char.x
let dy=target.y-char.y

let d=Math.hypot(dx,dy)

dx/=d
dy/=d

bullets.push(new Bullet(char.x,char.y,dx*6,dy*6,20,char))

char.reload=0

}

document.addEventListener("keydown",e=>{

if(e.code=="Space")shoot(player)

if(e.key=="c"){
player.hp=Math.min(player.maxHp,player.hp+30)
}

if(e.key=="v"){
if(player.ult>=100){

for(let i=0;i<8;i++){

let a=i*Math.PI/4

bullets.push(new Bullet(player.x,player.y,Math.cos(a)*6,Math.sin(a)*6,25,player))

}

player.ult=0

}
}

if(e.key=="b"){
player.speed=5
setTimeout(()=>player.speed=2,3000)
}

})

function botAI(bot){

if(Math.random()<0.02){

bot.x+=rand(-40,40)
bot.y+=rand(-40,40)

}

if(Math.random()<0.01){
shoot(bot)
}

}

function update(){

player.update()

for(let b of bots){

b.update()

botAI(b)

b.x=Math.max(20,Math.min(W-20,b.x))
b.y=Math.max(20,Math.min(H-20,b.y))

}

for(let bullet of bullets){

bullet.update()

}

for(let bullet of bullets){

for(let b of bots){

let d=Math.hypot(bullet.x-b.x,bullet.y-b.y)

if(d<20 && bullet.owner!=b){

b.hp-=bullet.damage

b.lastHit=Date.now()

player.ult+=5

bullet.dead=true

}

}

}

for(let bullet of bullets){

for(let w of walls){

if(bullet.x>w.x&&bullet.x<w.x+w.w&&bullet.y>w.y&&bullet.y<w.y+w.h){
bullet.dead=true
}

}

}

for(let i=bullets.length-1;i>=0;i--){
if(bullets[i].dead)bullets.splice(i,1)
}

}

function draw(){

ctx.clearRect(0,0,W,H)

ctx.fillStyle="#555"

for(let w of walls){
ctx.fillRect(w.x,w.y,w.w,w.h)
}

player.draw()

for(let b of bots)b.draw()

for(let bullet of bullets)bullet.draw()

}

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()
