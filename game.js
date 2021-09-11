kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

//constante MOVE_SPEED singifica a velocidade de movimento a cada vez que o jogador apertar o botão designado por algum eventListener keyDown
//constante JUMP_FORCE faz o mesmo que move speed porém pro player pular.
//BIG_JUMP_FORCE é a força do pulo do mario quando comer o cogumelo
//isJumping é pra verificar se o player está pulando ou não, e então poder dar destroy() nos gumbas.
//const FALL_DEATH é o valor que ao ser maior ou igual a 400 vai dar game over
const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 400








//carregando a raiz, tirei do imgur mas poderia ser de uma pasta htdocs dentro do xampp
loadRoot('https://i.imgur.com/')
//criando sprites e atribuindo suas respectivas imagens
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')


scene("game", ({ level, score }) => {
    //criando "objetos", fora das chaves significa que o 'obj' é o que vai ser utilizado como padrão
    layers(['bg', 'obj', 'ui'], 'obj')
    //desenhando o mapa
    const maps = [
        [
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '     %   =*=%=                        ',
            '                                      ',
            '                            -+        ',
            '        $           ^   ^   ()        ',
            '==============================   =====',
        ],
        [
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£        @@@@@@              x x        £',
            '£                          x x x        £',
            '£                        x x x x  x   -+£',
            '£               z   z  x x x x x  x   ()£',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ]



    ]
    //atribuindo os sprites aos respectivos caracteres utilizados para desenhar na matriz
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        //('coin'), 'coin'] a repetição significa que estou dando pra o sprite um tag, para ser diferenciado caso eu vá usar o mesmo sprite
        //só que para coisas diferentes.
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '£': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],

    }


    const gameLevel = addLevel(maps[level], levelCfg)

    //colocando uma UI que demonstra a quantidade de moedas do jogador
    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }
    ])
    //mostrando a level que o jogador está
    add([text('level ' + parseInt(level + 1) ), pos(40, 6)])


    //função que cordena os tamanhos do jogador

    function big() {
        let timer = 0
        let isBig = false
        return {
          update() {
            if (isBig) {
              CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
              timer -= dt()
              if (timer <= 0) {
                this.smallify()
              }
            }
          },
          isBig() {
            return isBig
          },
          smallify() {
            this.scale = vec2(1)
            CURRENT_JUMP_FORCE = JUMP_FORCE
            timer = 0
            isBig = false
          },
          biggify(time) {
            this.scale = vec2(2)
            timer = time
            isBig = true     
          }
        }
      }


    const player = add([
        sprite('mario'), solid(),
        //pos(x, y) e é por pixel
        pos(30, 0),
        body(),
        big(),
        origin('bot')

    ])

    //fazer o cogumelo se mover para a direita quando invocado
    action('mushroom', (m) => {
        m.move(30, 0)
    })
    //fazendo o gumba se mover
    const ENEMY_SPEED = 20
    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0)
    })


    //função pra quando o player cabecear um bloco surgir uma moeda

    player.on("headbump", (obj) => {
        //coin surprise é o bloco que tem moeda dentro
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        //mushroom surprise é o bloco que contém o cogumelo para crescer
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })




    //fazendo o evento de colisão do player com o cogumelo, fazendo o jogador crescer pelo tempo que você atribuir, que no caso coloquei 6
    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })
    //evento de colisão com moedas
    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })
    //evento de colisão com gumbas
    player.collides('dangerous', (d) => {
        if (isJumping) {
          destroy(d)
        } else {
          go('lose', { score: scoreLabel.value})
        }
      })
    //evento de perda por queda
    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value })
        }
    })

    //evento de entrar pelo cano
    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })


    //agora adicionando event listeners pro nosso jogador usando métodos da biblioteca Kaboom
    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        if (player.grounded()) {
            isJumping = false
        }
    })

    keyPress('space', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

})
scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})

start("game", { level: 0, score: 0 })