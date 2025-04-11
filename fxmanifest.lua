fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'Vein Minigames - A collection of interactive minigames for QBX/QBCore'
version '1.0.0'

shared_scripts {
    '@qbx_core/shared/locale.lua',
    'shared/config.lua',
    'shared/utils.lua'
}

client_scripts {
    'client/main.lua',
    'client/games/*.lua',
    'client/framework/*.lua'
}

server_scripts {
    'server/main.lua',
    'server/framework/*.lua'
}

ui_page 'web/build/index.html'

files {
    'web/build/index.html',
    'web/build/**/*'
}

lua54 'yes'

dependencies {
    'qbx_core'
} 