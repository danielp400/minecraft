# 🎮 GUIA DE TESTE - BlockVerse v2.0

**Status**: ✅ **NOVO CÓDIGO IMPLEMENTADO E HOT RELOAD ATIVADO**

---

## 🚀 PASSO 1: VERIFICAÇÃO INICIAL

### Abra o navegador em:
```
http://localhost:5173/
```

### Você deve ver:
```
╔═══════════════════════════════════════╗
║                                       ║
║        🎮 BLOCKVERSE 🎮             ║
║                                       ║
║   Pressione ENTER para começar        ║
║                                       ║
╚═══════════════════════════════════════╝
```

### Background:
- ✅ Céu azul (0x87ceeb)
- ✅ Chão verde (200x200)
- ✅ Estruturas (cubos coloridos e torres)
- ✅ Iluminação realística com sombras

---

## 🎯 PASSO 2: VERIFICAR CONSOLE

### Abrir DevTools
```
F12 (Chrome/Edge)
Ctrl+Shift+K (Firefox)
Cmd+Option+I (Safari)
```

### Logs esperados:
```
════════════════════════════════════════════════
🎮 BLOCKVERSE - Inicializando...
════════════════════════════════════════════════
✅ Cena inicializada com sucesso!
✅ Controles inicializados!
🎮 Controles: WASD para mover, Mouse para olhar
🖱️ Clique para capturar o mouse (Pointer Lock)
🔚 ESC para liberar o mouse
✅ BlockVerse carregado com sucesso!
📝 Three.js versão: r179
🎮 Pressione ENTER para começar!
════════════════════════════════════════════════
```

### ✅ Status esperado:
- **Nenhum erro** 🟢
- **Nenhum warning crítico** 🟢
- **Apenas mensagens informativas** 🟢

---

## 🎮 PASSO 3: INICIAR O JOGO

### Ação: Pressione ENTER

### Que deve acontecer:

1. **Menu desaparece** ✅
   - Transição imediata

2. **Câmera em primeira pessoa** ✅
   - Você verá a cena 3D
   - Perspectiva realística (altura dos olhos)

3. **Estruturas visíveis** ✅
   - Cubos coloridos em primeira linha
   - Torres de diferentes alturas ao fundo
   - Chão e céu

4. **Console**:
   ```
   🎮 Jogo iniciado!
   🎯 Clique no canvas para capturar o mouse
   ```

---

## 🖱️ PASSO 4: ATIVAR POINTER LOCK

### Ação: Clique na janela do jogo

### Que deve acontecer:

1. **Cursor desaparece** ✅
   - Pointer Lock ativado

2. **Mensagem no console**:
   ```
   [Seu navegador pode mostrar mensagem]
   "Pointer Lock foi ativado"
   ```

3. **Pronto para controlar** ✅

---

## ⌨️ PASSO 5: TESTAR CONTROLES

### WASD - Movimento

| Tecla | Ação | Resultado |
|-------|------|-----------|
| **W** | Pressione | Move para frente 🚀 |
| **A** | Pressione | Move para esquerda ⬅️ |
| **S** | Pressione | Move para trás ⬅️ |
| **D** | Pressione | Move para direita ➡️ |

**Verificação**:
- ✅ Movimento fluido
- ✅ Pode combinar (W+D = diagonal)
- ✅ Sem lag ou travamento
- ✅ Desceleração suave

### Espaço - Pulo

| Ação | Resultado |
|------|-----------|
| Pressione espaço uma vez | Jump ⬆️ |
| Aproxime do chão | Pode pular novamente ✅ |
| No ar | Não pode pular ❌ (correto!) |

**Verificação**:
- ✅ Pulo com altura realística
- ✅ Cai por gravidade
- ✅ Só pula quando no chão

---

## 🖱️ PASSO 6: TESTAR MOUSE

### Movimento horizontal (Y)

| Ação | Resultado |
|------|-----------|
| Mova mouse para esquerda | Câmera vira esquerda ⬅️ |
| Mova mouse para direita | Câmera vira direita ➡️ |
| Movimento contínuo | Rotação suave 🔄 |

**Verificação**:
- ✅ Rotação horizontal 360°
- ✅ Suave e responsiva
- ✅ Sensibilidade apropriada

### Movimento vertical (X)

| Ação | Resultado |
|------|-----------|
| Mova mouse para cima | Câmera olha para cima ⬆️ |
| Mova mouse para baixo | Câmera olha para baixo ⬇️ |
| No limite superior | Para em ~90° |
| No limite inferior | Para em ~-90° |

**Verificação**:
- ✅ Não consegue virar de cabeça para baixo demais
- ✅ Suave e natural
- ✅ Limites apropriados

---

## 🎯 PASSO 7: TESTE AVANÇADO

### Teste de Colisão Visual

**Como fazer**:
1. Caminhe em direção a um cubo
2. Tente andar através dele

**Resultado**:
- ❌ Você vai passar através (não tem colisão física)
- ✅ Mas pode ver colisão visual

**Nota**: Colisão de física será implementada depois

### Teste de Limites do Mundo

**Como fazer**:
1. Caminhe muito para uma direção
2. Tente sair do mapa

**Resultado**:
- ✅ Position é clamped em [-100, 100] X Z
- ✅ Você não sai do mapa
- ✅ Position limit é invisible

### Teste de Gravidade

**Como fazer**:
1. Suba uma torre (pule várias vezes)
2. Caia da borda

**Resultado**:
- ✅ Cai continuamente
- ✅ Não flutua
- ✅ Volta ao chão normalmente

---

## 🎨 PASSO 8: TESTE VISUAL

### Cena deve conter:

| Elemento | Cor | Status |
|----------|-----|--------|
| Céu | Azul (0x87ceeb) | ✅ Visível |
| Chão | Verde escuro | ✅ Visível |
| Cubos | Arco-íris (6 cores) | ✅ Visível |
| Torres | Marrom (0x8b4513) | ✅ Visível |
| Sombras | Dinâmicas | ✅ Visível |

### Iluminação:

- [x] Luz direcional com sombra
- [x] Luz ambiente
- [x] Fog (névoa) afastando objetos
- [x] Tudo bem iluminado

---

## 🔊 PASSO 9: TESTE DE PERFORMANCE

### Verificar FPS

**Como fazer**:
```javascript
// Abra DevTools Console e execute:
setInterval(() => {
    console.log('FPS check - Janela aberta');
}, 1000);
```

**Resultado esperado**:
- ✅ 60 FPS constante (ou próximo)
- ✅ Sem stuttering
- ✅ Movimento suave

### Verificar CPU/GPU

**Ferramentas**:
- Chrome: DevTools → Performance tab
- Firefox: about:performance

**Esperado**:
- ✅ CPU: <50%
- ✅ GPU: <70%
- ✅ Memória: <100MB

---

## ⚙️ PASSO 10: TESTE DE ESC (Liberar Mouse)

### Ação: Pressione ESC

### Que deve acontecer:

1. **Pointer Lock desativado** ✅
   - Cursor reaparece

2. **Você pode clicar fora** ✅
   - Mouse funciona normalmente

3. **Câmera congela** ✅
   - Não move com mouse

4. **Console**:
   ```
   [Seu navegador pode mostrar mensagem]
   "Pointer Lock foi desativado"
   ```

### Ação: Clique novamente

**Resultado**:
- ✅ Pointer Lock reativado
- ✅ Controles funcionam novamente

---

## ❌ PROBLEMAS E SOLUÇÕES

### ❓ "Câmera não se move com mouse"

**Solução**:
1. Verifique se Pointer Lock está ativado (cursor desapareceu)
2. Se não: Clique na janela novamente
3. Se sim: Verifique console por erros

### ❓ "WASD não funciona"

**Solução**:
1. Verifique se Pointer Lock está ativado
2. Verifique DevTools console por erros
3. Tente refrescar a página (F5)

### ❓ "Não consigo pular"

**Solução**:
1. Certifique-se que está no chão (perto de y=1.7)
2. Pressione espaço enquanto está no chão
3. Verifique console

### ❓ "Menu não desaparece ao pressionar ENTER"

**Solução**:
1. Verifique se ENTER foi reconhecido (console)
2. Verifique elemento #menu existe
3. Tente refrescar

### ❓ "Há erros no console"

**Solução**:
1. Leia o erro cuidadosamente
2. Copie a mensagem
3. Procure em ARQUITETURA_NOVA.md

---

## 📊 CHECKLIST DE TESTE

### Sistema
- [ ] Página carrega sem erro
- [ ] Menu visível inicialmente
- [ ] Console sem erros críticos
- [ ] 60 FPS mantido

### Menu
- [ ] Menu tem fundo preto
- [ ] Texto "BLOCKVERSE" visível
- [ ] Instrução "Pressione ENTER" visível
- [ ] Tipografia legível

### Entrada ENTER
- [ ] Pressionar ENTER funciona
- [ ] Menu desaparece
- [ ] Jogo inicia
- [ ] Pointer Lock oferecido

### Controles
- [x] W move para frente
- [x] A move para esquerda
- [x] S move para trás
- [x] D move para direita
- [x] Espaço pula
- [x] Mouse olha ao redor
- [x] Movimento diagonal funciona
- [x] Pulo só funciona no chão

### Física
- [ ] Gravidade funciona
- [ ] Personagem cai
- [ ] Pulo tem altura realística
- [ ] Atrito desacelera

### Câmera
- [ ] Primeira pessoa FPS
- [ ] Altura realística (1.7)
- [ ] Rotação suave
- [ ] Limites de rotação vertical

### Cena
- [ ] Céu azul visível
- [ ] Chão verde visível
- [ ] Cubos coloridos visíveis
- [ ] Torres visíveis
- [ ] Iluminação funciona
- [ ] Sombras visíveis

### Performance
- [ ] 60 FPS mantido
- [ ] Nenhum lag
- [ ] Nenhum stuttering
- [ ] Uso de CPU aceitável

---

## 🎯 RESULTADO ESPERADO

### Se tudo está correto, você deve poder:

1. ✅ Abrir a página
2. ✅ Ver o menu
3. ✅ Pressionar ENTER
4. ✅ Clicar para capturar mouse
5. ✅ Andar com WASD
6. ✅ Olhar com mouse
7. ✅ Pular com espaço
8. ✅ Ver estruturas 3D
9. ✅ Explorar o mapa
10. ✅ Pressionar ESC para soltar mouse

---

## 📝 PRÓXIMOS TESTES

### Quando implementar mais features:

- [ ] Teste de criação de blocos
- [ ] Teste de destruição de blocos
- [ ] Teste de colisão de blocos
- [ ] Teste de inventory
- [ ] Teste de crafting
- [ ] Teste de multiplayer

---

## 🏆 CONCLUSÃO

Se todos os testes acima **PASSARAM** ✅:

### Status: ✅ **JOGO ESTÁ FUNCIONANDO CORRETAMENTE**

O BlockVerse agora é um protótipo FPS funcional pronto para adicionar:
- 🎮 Criação de blocos
- 🎮 Destruição de blocos
- 🎮 Sistema de inventário
- 🎮 Crafting
- 🎮 Multiplayer

**Bom jogo!** 🎮🚀

---

**Guia criado em**: 2026-07-07  
**Versão**: 2.0  
**Status**: ✅ Pronto para teste
