import type { Disease } from '../types'

const data: Disease[] = [
  {
    "id": 1,
    "nome": "Quilodonelose",
    "nomeCientifico": "Chilodonella cypprini Moroff",
    "causa": "É um parasita ciliado e de forma oval que produz opacidade branco-azulada, alimenta-se de células epidirmicas destruídas e de céulas do epitílio branquial dos peixes. É transmissível por contvocêgio direto, sua multiplicação você rápida e ataca somente peixes debilitados.",
    "tratamento": "- Banho de tripaflavina por 24 horas (com esta medicação, o parasita morre em 10 horas). - Elevar a temperatura da água para 28C.",
    "sintoma": "- Nado e respiração com dificuldade - Coceira para se livrar dos parasitas",
    "imagem": "quilodonelose",
    "categoria": "protozoario"
  },
  {
    "id": 2,
    "nome": "Ictiofonose",
    "nomeCientifico": "Ichthyophonus hoferi",
    "causa": "É transmitido através de esporos de alimentos contaminados. Esse germe se desenvolve no estemago e intestinos, sendo eliminados pelas fezes. Alguns chegam a perfurar a parede do intestino e são levados pelo sangue a diversos orgãos como coração e fígado, onde ficam sob a forma de pequenos n�dulos pardos ou pretos. Quando eles se rompem, os órgãos são atacados e o peixe morre. S� aparece quando o parasita é levado por alimentos, materiais ou peixes contaminados, porém as más condições da água facilitam sua difusão. É transmissível através de feridas e abscessos ou pela ingestão de peixes mortos por ela. No estemago, o quisto se rompe, soltando as larvas infestantes.",
    "tratamento": "Atualmente não há cura, há casos que o peixe s� morre após 6 meses.",
    "sintoma": "Os primeiros sintomas são difíceis de ser identificados pois são muito diversificados. - Perda de apetite - Entorpecimento - Exolftalmia - Nadadeiras perdem pedaãos e ficam dobradas - O peixe fica escondido a maior parte do tempo - Instabilidade para nadar e movimentos estranhos - Fica no fundo com a barriga inchada - Pele e escamas vidradas - O peixe vira sobre o eixo e fica balan�ando - Ulcerações na pele - Emagracimento - Pele desbotada - Boca sempre aberta",
    "imagem": "ictiofonose",
    "categoria": "fungo"
  },
  {
    "id": 3,
    "nome": "Furunculose",
    "nomeCientifico": "Aeromonas salmonicida",
    "causa": "Doença de caráter infeccioso. As ulceras aparecem nas zonas mais ricas em vasos capilares. O agente etiológico causador É uma bactéria gram-negativa, imóvel e não produtora de esporos que, inserindo-se no peixe destr�i o tecido em redor do ponto de infecção.",
    "tratamento": "- Terramicina 500 mg /50 L de água por 24 horas, repetindo-se o banho dentro de 5 dias, até controlar.",
    "sintoma": "- Manchas vermelhas (dando impressão de ferimentos) - Bolhas de pus e sangue - Quando as bolhas se abrem há formação de úlceras (o pus liberado pode contaminar os outros peixes) - Escaras (buracos) do tipo ulceroso no corpo dos peixes (geralmente na cauda)",
    "imagem": "",
    "categoria": "bacteria"
  },
  {
    "id": 4,
    "nome": "Tricodiniase",
    "nomeCientifico": "Trichodina domerguei",
    "causa": "Cilióforo (protozário provido de colios) muito comum em aquários. Ataca os peixes quando se encontram muito debilitados",
    "tratamento": "- Banho de tripaflavina : 10 mg/litro de água/ 24 horas (com esta medicação, o parasita morre em 10 horas). - Elevar a temperatura da água para 28C. - Tratar as causas que levaram a debilidade (stress, deficiência na alimentação, água com parâmetros inadequados , etc).",
    "sintoma": "- Extrema irritação e coceira (produzindo hiperemia pelo ato de se coçar)",
    "imagem": "tricodiniase",
    "categoria": "protozoario"
  },
  {
    "id": 5,
    "nome": "Tuberculose pisciaria",
    "nomeCientifico": "Myxosoma cerebralis",
    "causa": "A transmissão ocorre devido  ingestão de esporos, presentes num portador (Tubifex). O parasita invade a cartilagem do peixe, produzindo necrose e deformidade. doença pouco comum em peixes de aquário, sendo comum em salmon�deos.",
    "tratamento": "Não há cura atualmente.",
    "sintoma": "- Movimentos rotatérios ao nadar - Emagrecimento na parte superior do corpo logo após a cabeça - Coloração escura na parte caudal",
    "imagem": "tuberculose",
    "categoria": "bacteria"
  },
  {
    "id": 6,
    "nome": "Chondrococcus",
    "nomeCientifico": "Limo dos peixes",
    "causa": "Peixes habituados a água de temperatura relativamente baixa, quando transferidos para águas de temperatura mais alta são suscetíveis é doença. A doença geralmente se inicia de uma ferida. Assim, peixes transportados ou colocados em recipientes pequenos e inadequados tem maiores probabilidades de adquirir a doença. Peixes que são retirados em redes ásperas, geralmente, apresentam feridas na boca e descamação no corpo, estando nestes casos sujeitos a doença.",
    "tratamento": "- Terramicina 500 mg/40-50 litros de água, em banho de 24 a 48 horas. - Tripaflavina 2 mg /25 L de água em banhos de 24 hora",
    "sintoma": "- Aparecimento de uma crosta no corpo aparentando limo ou mofo (que ataca também a boca) - Manchas branco-azuladas - Nadadeira caudal carcumida - Perda de movimentos - Boqueja - Em algumas espCies há o aparecimendo do anel hipérmico (super abundância de sangue) na cauda e �s vezes ao redor dos olhos. - Tremores",
    "imagem": "chondrococcus",
    "categoria": "bacteria"
  },
  {
    "id": 7,
    "nome": "Buraco na Cabeça",
    "nomeCientifico": "Hole-in-Head",
    "causa": "Em peixes ornamentais é muito comum a manifestação da doença associada a outros parasitas ou agentes patogonicos oportunistas, como bactérias, isso ocorre devido a queda das defesas do peixe.",
    "tratamento": "- Metronidazol (Flagyl / 400mg).250mg /100 g de alimento em pasta ou vivo, 2 vezes ao dia, por 10 dias. - Sempre que o peixe tolerar temperaturas mais altas, a mesma deve sempre ser lentamente aumentada até 32C ou o mais próximo poss�vel disso (o m�ximo tolerado pela espCie), pois com temperaturas menores que 31C dificilmente qualquer tratamento funcionar�. - Antiss�pticos e/ou de antibi�ticos (merc�rio-cromo, Rifocina spray, Povidine, Betadine, Permanganato de Potássio) se faz quase sempre necess�rio nesses casos",
    "sintoma": "- Despigmentação e/ou surgimento de pequenos orifCios na região pr�xima a cabeça (inicialmente menores, porém aumentam gradativamente seu tamanho e profundidade, podendo ocorrer infecções secundárias por bactérias, fungos ou protozoários) - Desnutrição - Fraqueza geral (caquexia) - Gastroenterite (infecção que atinge o sistema gastrointestinal) - Peritonite (inflamação do perit�nio)",
    "imagem": "buraco",
    "categoria": "protozoario"
  },
  {
    "id": 8,
    "nome": "Dactilogirose",
    "nomeCientifico": "Flukes",
    "causa": "Verme parasita de 4 olhos e 2 trombas que secretam um líquido irritante. O parasita se fixa no peixe por meio de um disco especial e introduz sua tromba para sugar o sangue do peixe. Se reproduz por ovos. Ele é pouco comum em aquários com peixes ornamentais. Quando a infestação é grande pode haver destruição do tecido branquial e ruptura dos vasos, causando a morte por asfixia ou hemorragia. ",
    "tratamento": "Azul metileno 2 mg / 1 L de água + Formalina (40%) 2 ml / 10 L de água, banhos de 30 a 45 minutos, retire o peixe ao apresentar sinais de ang�stia. Usar areação durante o tratamento. após 3 dias, trocar metade da água. Banho de sal comum, 10 a 15 g / 1 L de água.",
    "sintoma": "- Aumento das guelras - Ficam pálidos, salientes - Bordas engrossadas - Os oparculos (placas ósseas localizadas ao lado da cabeça do peixe) ficam entreabertos",
    "imagem": "dactilogirose",
    "categoria": "parasita"
  },
  {
    "id": 9,
    "nome": "Costiose",
    "nomeCientifico": "Costia sp.",
    "causa": "Não identificadas.",
    "tratamento": "Aqualife ou Labcon Ictio ( 1 gota / 2 litros de água) Verde de Malaquita, Tripaflavina ou ainda Formol. Banho, no aquário/hospital, numa solução de 2mg/l de Permanganato de Potássio (KMnO4). Banho de sal (2,5 g/l de água) de 10 a 20 minutos por dia até que a pele fique clara.",
    "sintoma": "Os peixes contaminados costumam concentrar-se em locais de água movimentada.  Podem se coçar em locais duros como pedras e cascalho, normalmente apresentando aspecto apático e ficando no fundo do aquário. Um brilho cinzaazulado pode ser notado nos flancos do animal. Inicialmente, o peixe perde o apetite. Causa forte turvação na pele (manchas esbranqui�adas), podendo mesmo nos casos mais graves, levar á destruição da pele, provocando feridas com sangramento. Podem ser também visíveis algumas ramificações vermelhas nas barbatanas. ",
    "imagem": "costiose",
    "categoria": "protozoario"
  },
  {
    "id": 10,
    "nome": "Mofo dos peixes",
    "nomeCientifico": "Saprolegnia sp.",
    "causa": "Fungo que ataca preferencialmente peixes feridos e debilitados",
    "tratamento": "Banho prolongado (4 dias) no exemplar em um aquário/hospital com sal marinho 10g/litro de água. Para reforçar o tratamento, mergulhe-o duas vezes ao dia numa solução de sal marinho 25g/ litro de água.",
    "sintoma": "Manchas brancas ou tufos semelhantes a algodão no corpo, desanimo e falta de apitite. ",
    "imagem": "mofo",
    "categoria": "fungo"
  },
  {
    "id": 11,
    "nome": "Verme Ancora",
    "nomeCientifico": "Lernaea sp",
    "causa": "A disseminação deste parasita se de através da água contaminada, ou com peixes infestados com fêmeas adultas. A procriação é rápida, difundindo o parasita rapidamente nos outros animais.",
    "tratamento": "Uma vez o peixe com o parasita Lernaea, você deve delicadamente pegar o peixe na mão e remover o parasita com o auxílio de uma pin�a. após a retirada do parasita, passe algum medicamento parasiticida no local da remoção, evitando o surgimento de novas doenças através da ferida no corpo.",
    "sintoma": "Efeitos nas brânquias: lesões com perda da arquitetura branquial e redução da sua função devido a atividade alimentar do parasita. Pode ocorrer ainda oclusão tempor�ria, ou permanente da circulação pela fixação do parasita. O tecido branquial pode ainda sofrer necrose e desintegração local, ou difusa;  Efeitos nas brânquias: lesões com perda da arquitetura branquial e redução da sua função devido a atividade alimentar do parasita. Pode ocorrer ainda oclusão tempor�ria, ou permanente da circulação pela fixação do parasita. O tecido branquial pode ainda sofrer necrose e desintegração local, ou difusa;  Efeitos gerais: freq�entemente há uma perda de peso do hospedeiro. Peixes infestadospor ectoparasitas sofrem de constante irritação na superfCie do corpo e são obrigados a conviver com esta situação estressante. é poss�vel observar mudan�as no comportamento de peixes parasitados, pois estes freq�entemente tentam se livrar destes parasitas ao realizar fricção contra objetos duros, pedras, etc...",
    "imagem": "verme",
    "categoria": "parasita"
  },
  {
    "id": 12,
    "nome": "Podridao das Nadadeiras",
    "nomeCientifico": "",
    "causa": "A colonização original geralmente é produzida por Pseudomonas fluorescens e Aeromonas liquefasciens , seguidas por Mycobacterium sp. e Myxobacterias do genero Cytophaga columnaris e outras. Os tecidos necróticos servirão de meio de cultura para fungos dos g�neros Saprolegnia e Achyla que também favorecem a perda das mesmas.  Quando a colonização destr�i a nadadeira e se localiza no ped�nculo caudal, a doença se torna muito difCil de regredir ocorrendo invasão da corrente sangu�nea e septicemia",
    "tratamento": "Oxitetraciclina (Terramicina) 500 mg/ 50 litros de água, renovando-se 1/3 da água a cada 24 horas durante cinco dias. Pincelar as nadadeiras com Iodo-Povidine ou com pomada de Neomicina Aumentar a temperatura do aquário para 30C.",
    "sintoma": "Necrosa das nadadeiras, peixe amoitado.",
    "imagem": "podridao",
    "categoria": "bacteria"
  },
  {
    "id": 13,
    "nome": "Lepidortose",
    "nomeCientifico": "",
    "causa": "Perda de escamas por todo o corpo e mais no dorso, movimentos cada vez mais lentos, respiração acelerada e paralisação da cauda, peixe fica na superfCie pendendo seus reflexos.",
    "tratamento": "Aureomicina 50 mg/litro de água em banhos por 4 dias. Cloromicetina 10 mg/litro de água.",
    "sintoma": "Perda de escamas por todo o corpo e mais no dorso, movimentos cada vez mais lentos, respiração acelerada e paralisação da cauda, peixe fica na superfCie pendendo seus reflexos.",
    "imagem": "lepidortose",
    "categoria": "bacteria"
  },
  {
    "id": 14,
    "nome": "Piolho de peixe",
    "nomeCientifico": "Argulus sp.",
    "causa": "Um crustáceo se alimenta principalmente de céulas sanguíneas, popularmente conhecido como Argulus sp. Esse piolho pode chegar a aquários de aquaristas ansiosos que não observam com cuidado os peixes expostos para vendas.",
    "tratamento": "A remoção desse parasita deve ser efetuada com pin�as e em seguida realizar um tratamento no peixe atacado para que tais lesões ocasionadas pelo Argulus não se tornem portas de entrada para futuras doenças consequentes. Esse tratamento poderá ser feito com produtos para cicatrização de lesão, vendido em qualquer loja de aquarismo.",
    "sintoma": "Quando afetado peixe fica visivelmente abatido e desnutrido. O Argulus é visivel porem por conta de seu tamanho aproximadamente 8mm, fica dificil de se ver. Pode atacar qualquer parte do corpo porem é mais comum encontrar-los nas nadadeiras",
    "imagem": "piolho",
    "categoria": "parasita"
  },
  {
    "id": 15,
    "nome": "Girodactilose",
    "nomeCientifico": "",
    "causa": "Verme cego de 0,5 a 0,8 mm de comprimento, que tem uma ventosa na boca e um gancho na cauda, pelo qual se fixa no peixe.",
    "tratamento": "Verme cego de 0,5 a 0,8 mm de comprimento, que tem uma ventosa na boca e um gancho na cauda, pelo qual se fixa no peixe.",
    "sintoma": "Peixe vai ficando cada vez mais pálido, a pele produz mais mucosidade e com manchas ou pontos hemorrágicos também nas nadadeiras notando a respiração acelerada. O peixe fica tristonho, cansado, com os movimentos cada vez mais lentos, permanecendo na superfCie podendo vir a morrer.",
    "imagem": "girodactilose",
    "categoria": "parasita"
  },
  {
    "id": 16,
    "nome": "Tripanoplasmose",
    "nomeCientifico": "Trypanoplasma sp",
    "causa": "Estes protozoários parasitam o peixe através da corrente sanguínea do animal e são transmitidos de um peixe a outro pelas picadas das sanguessugas",
    "tratamento": "Geralmente é incurável. A profilaxia consiste em se evitar sanguessugas no aquário (geralmente trazidas por plantas ou enfeites já utilizados). ",
    "sintoma": "O sintoma da doença no peixe é semelhante ao da \"doença do sono\" no homem. Os peixes atacados apresentam um estado letúrgico, isto é, ficam sem movimentos, enfraquecem, apresentam anemia e olhos fundos. Ficam em posição obl�qua, apoiando a cabeça no fundo do aquário podendo morrer de inanição",
    "imagem": "",
    "categoria": "protozoario"
  },
  {
    "id": 17,
    "nome": "Ictio ou Pontos Brancos",
    "nomeCientifico": "Ichthyophthirius multifiliis",
    "causa": "É um protozoário ciliado (cílios ou tentáculos sugadores). Existem diversas espCies de Ichthyophthirius, que infectam tanto peixes de água doce ou salgada. - Em maiores temperaturas se torna mais perigoso, pois completa seu ciclo mais rápido. - Não sobrevive em concentrações baixas de oxigênio ou em águas ácidas (pH < 5). - A aparição do parasita ocorre principalmente na superfCie dorsal, cabeça, abaixo da pele, guelras e brânquias, aonde se formam cistos.",
    "tratamento": "- Para aquários recomenda-se troca de temperatura variando de 33C pela manhá (durante 6 horas) e ao anoitecer 21C, repita o processo de 3 a 5 dias. - 1g de Verde de Malaquita para cada 10m� por 10 dias a uma temperatura de 4 a 10C. Este m�todo s� deve ser empregado em alevinos e juvenis. - Banho de tripaflavina com temperatura de 30C durante pelo menos 3 semanas. - Administrar sal não iodado dilu�do previamente numa solução homog�nea em 20g por litro de água com bastante aeração durante 2 a 5 minutos. - Evite a exposição do peixe aos parasitas, caso o peixe seja infectado, fa�a o tratamento o mais r�pido poss�vel. - Muitas das vezes a infecção ocorre devido a introdução de novos peixes no aquário, os mesmos devem ficar em quarentena (2 a 3 semanas), a água usada deve deve ter 24C de tempetatura (ideal para o desenvolvimento do parasita). - Sempre que poss�vel realizar trocas parciais de água e desinfetar frequentemente os materiais de uso coletivo.",
    "sintoma": "Ictiofitir�ase, Pontos Brancos, ou, simplesmente, Ctio, é uma das doenças mais comuns e devastadoras enfrentadas pelos que lidam com peixes de água doce. - Inicialmente: aparição de pontos brancos na superfCie do peixe, barbatanas encolhidas, nado e saltos irregulares, coçar-se em pedras, diminuição de apetite e aumento na produção de muco. - Fase mais aguda: desenvolvimento de úlceras, que o fazem perder sua vitalidade, ficando parados no fundo do aquário até morrerem. Fungos e bactérias podem se aproveitar da fragilidade do peixe, porém peixes sobreviventes tornam-se mais resistentes.",
    "imagem": "ictio",
    "categoria": "protozoario"
  },
  {
    "id": 18,
    "nome": "Plistoforose",
    "nomeCientifico": "Doenca dos neons",
    "causa": "Causada pelo Esporozório Plistophora hyphessobryconis, a Plistoforose ataca principalmente os Néon, Hyphessobrycon, Brachidanio. Invadindo a musculatura do tronco onde se reproduz, podendo observar locais com palidez e edema (inchaão). As baixas temperaturas favorecem a doença.",
    "tratamento": "A cura para a doença dos neons é muito díficil, aconselha-se tentar banho de solução de 2,5g de euflavina ou 2g de azul de metileno para 100 L de água, durante 15 dias. Manter o aquário com boas temperaturas.",
    "sintoma": "- Perda de apetite - Nado noturno agitado - Agonia intensa - Descoloração dos pigmentos da pele até a descoloração total - Afastamento do cardume - Emagrecimento (abdômen retraído) - Endurecimento e destruição dos tecidos, atacando os rins",
    "imagem": "doenca_neon",
    "categoria": "protozoario"
  },
  {
    "id": 19,
    "nome": "Oodiniose",
    "nomeCientifico": "Doença de veludo",
    "causa": "O contágio é direto, por uma forma flagelada infectante de seu ciclo de vida que pode deslocar-se ativamente a procura de um novo hospedeiro. É extremamente perigosa entre peixes pequenos, principalmente para carac�deos (Neon, Rod�stomus, etc.), podendo \"devastar\" um aquário em menos de 6 horas.",
    "tratamento": "- Azoo anti-oodinium. - Banhos demorados de tripaflavina. - Azul de metileno 2 gotas 5% / 5 L de água , durante 5 dias. - Elevação da temperatura a 30� C e escurecimento total do ambiente. - Retirar as plantas e todos os objetos do aquário.",
    "sintoma": "Inicialmente os sintomas são inespec�ficos e podem ocorrer: - Irritação cut�nea - Aumento de produção de muco - Disturbios natatérios Conforme a doença de veludo torna-se mais intensa o peixe apresenta os seguintes sintomas: - Surgimento de manchas brilhantes acastanhadas na superfCie do corpo (que se assemelha a um veludo) - Disfunção respiratéria - Congestão e hiperplasia branquial  Est�gios ag�nicos com peixes indo ao fundo com o ventre para cima e nados em rodopio sucedem a fase de disfunção respiratéria e nenhum tratamento pode reverter o quadro.",
    "imagem": "veludo",
    "categoria": "protozoario"
  },
  {
    "id": 20,
    "nome": "Exoftalmia",
    "nomeCientifico": "",
    "causa": "Pode ter diferentes causas (ascite infecciosa, tuberculose , parasitas (Diplozoon , Gyrodactylus e Dactylogyrus) , fatores quimicos como aquário mal equilibrado e defici�ncias alimentares.",
    "tratamento": "Não há tratamento específico, alguns metodos adotados: Banho de sal durante 36 horas Col�rios: Argirol a 5% e Cloranfenicol 5% Baixar a temperatura da água diminui a pressão ocular. Cloranfenicol 250 mg/20 litros de água. Uso de condicionadores (Aquasafe) , trocas parciais de água e alimentação adequada ajudam a prevenir a exoftalmia.",
    "sintoma": "� produzida por ac�mulo de l�quido na cavidade ocular do peixe afetado. Este excesso de l�quido produz edema do globo ocular com protusão do mesmo.",
    "imagem": "exoftalmia",
    "categoria": "outro"
  }
]

export default data
