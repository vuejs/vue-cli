# Criando um Projeto

## vue create

Para criar um novo projeto, execute:

``` bash
vue create hello-world
```

::: warning Atenção
Se você estiver no Windows usando o Git Bash com o minTTY, os prompts interativos não funcionarão. Você deve iniciar o comando como `winpty vue.cmd create hello-world`.
:::

Você será solicitado a escolher uma predefinição. Você pode escolher a predefinição padrão que vem com uma configuração básica do Babel + ESLint ou selecionar "Selecionar recursos manualmente" para selecionar os recursos necessários.

![Visualização do CLI](/cli-new-project.png)

A configuração padrão é ótima para prototipar rapidamente um novo projeto, enquanto a configuração manual fornece mais opções que provavelmente são necessárias para mais projetos orientados à produção.

![Visualização do CLI](/cli-select-features.png)

Se você optar por selecionar recursos manualmente, no final dos prompts, também terá a opção de salvar suas seleções como uma predefinição para poder reutilizá-las no futuro. Discutiremos predefinições e plugins na próxima seção.

::: tip ~/.vuerc
As predefinições salvas serão armazenadas em um arquivo JSON chamado `.vuerc` no diretório inicial do usuário. Se você deseja modificar predefinições/opções salvas, pode fazê-lo editando este arquivo.

Durante o processo de criação do projeto, você também pode ser solicitado a selecionar um gerenciador de pacotes preferencial ou usar o [espelho de registro Taobao npm](https://npm.taobao.org/) para uma instalação de dependência mais rápida. Suas escolhas também serão salvas em `~/.vuerc`.
:::

O comando `vue create` possui várias opções e você pode explorá-las todas executando:

``` bash
vue create --help
```

```
Uso: create [opções] <app-name>

crie um novo projeto desenvolvido pelo vue-cli-service


Opções:

  -p, --preset <presetName>       Ignore os prompts e use a predefinição salva ou remota
   -d, --default                  Ignora os prompts e usa a predefinição padrão
   -i, --inlinePreset <json>      Ignora os prompts e usa uma string JSON como predefinida
   -m, --packageManager <command> Usa o cliente npm especificado ao instalar dependências
   -r, --registry <url>           Use o registro npm especificado ao instalar dependências (somente para npm)
   -g, --git [message | false]    Força / ignora a inicialização do git, opcionalmente especifica a mensagem de commit inicial
   -n, --no-git                   Ignorar a inicialização do git
   -f, --force                    Sobrescrever o diretório de destino, se existir
   -c, --clone                    Usa o git clone ao buscar a predefinição remota
   -x, --proxy                    Use o proxy especificado ao criar o projeto
   -b, --bare                     Projeto Scaffold sem instruções para iniciantes
   -h, --help                     Informações de uso de saída
```

## Usando a GUI

Você também pode criar e gerenciar projetos usando uma interface gráfica com o comando `vue ui`:

``` bash
vue ui
```

O comando acima abrirá uma janela do navegador com uma GUI que o guiará pelo processo de criação do projeto.

![Visualização da interface do usuário](/ui-new-project.png)

## Puxando Modelos 2.x (Legado)

O Vue CLI 3 usa o mesmo binário `vue`, então ele sobrescreve o Vue CLI 2 (`vue-cli`). Se você ainda precisa da funcionalidade legada `vue init`, você pode instalar uma ponte global:

``` bash
npm install -g @vue/cli-init
# O vue init agora funciona exatamente da mesma maneira que vue-cli@2.x
vue init webpack my-project
```
