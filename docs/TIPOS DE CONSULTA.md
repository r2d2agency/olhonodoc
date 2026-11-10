auto veiculo company

https://webservice.companyconferi.com.br/api-clientes/documentacao/documentacao/introducao



Conferi Auto Veiculo

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-veiculo?responseType=xml

Importante

Os insumos associados a este produto podem estar ou não omitidos para uso, variando se estão ou não ativos na consulta propriamente. Para compreender melhor se um serviço está ou não disponibilizado, procure o atendimento da Company Conferi ou entre em contato.

\# Método da Requisição

A requisição para o endpoint do produto Conferi Auto Veiculo deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-veiculo/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-veiculo/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que deve conter os seguintes campos: placa ou chassi e produto.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

produto	Produtos. O nome do produto solicitado deve ser informado exatamente como: 'conferi-auto-veiculo'. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "ABC9999",

&#x20;   "produto": "conferi-auto-veiculo"

&#x20; }

}

Aviso

Nos exemplos a seguir, os insumos estão organizados conforme os tipos de resposta: Com registro, Nenhum Registro Encontrado e Sistema indisponível. No entanto, no retorno real, os insumos apresentarão um desses três tipos de resposta, conforme o resultado das bases consultadas, sem seguir necessariamente o mesmo agrupamento dos exemplos.

\# Comercialização

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Valores	Descrição

0	Não Consta. Number

1	CONSTA COMERCIALIZAÇÃO. Number

2	Indisponível. Number

3	SUJEITO A OFERTA EM LEILÃO / NÃO CONSTA COMERCIALIZAÇÃO / Passagem por Pátio. Number

4	CONSTA COMERCIALIZAÇÃO E SUJEITO A OFERTA EM LEILÃO / Passagem por Pátio. Number

5	SUJEITO A OFERTA EM LEILÃO / Passagem por Pátio. Number

6	NÃO CONSTA COMERCIALIZAÇÃO / CONSTA DESMOBILIZAÇÃO DE FROTA. Number

7	CONSTA COMERCIALIZAÇÃO / CONSTA DESMOBILIZAÇÃO DE FROTA. Number

8	CONSTA COMERCIALIZAÇÃO POR BANCO Number

9	CONSTA COMERCIALIZAÇÃO POR SEGURADORA Number

10	CONSTA COMERCIALIZAÇÃO POR FROTA Number

11	CONSTA COMERCIALIZAÇÃO POR SEGURADORA E BANCO Number

\# Indicio de Sinistro

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Valores	Descrição

0	Não existe indício de sinistro. Number

1	Encontrado indício de sinistro. Number

\# Indicio de Sinistro 2

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado.



Valores	Descrição

nulo	VAZIO Null

0	NÃO CONSTA. Number

1	VEÍCULO COM ACIONAMENTO DE SEGURO SEM INDENIZAÇÃO INTEGRAL. Number

\# Sinistro

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Resposta	Mensagem

NAO	NAO EXISTE SINISTRO DE INDENIZAÇÃO INTEGRAL String

SIM	ENCONTRADO SINISTRO DE INDENIZAÇÃO INTEGRAL String

VAZIO	"" String

SIM	ENCONTRADO SINISTRO DE INDENIZAÇÃO INTEGRAL / AVARIAS String

Aviso

A resposta de valor \&dlquot;vazio\&dlquot; significa que há a ausência de informação presente no campo, devida indisponibilidade do serviço associado.

\# Parecer Técnico

O Parecer Técnico indica a aceitação do veículo no mercado securitário da seguinte maneira.



Valores	Descrição

verde	A cor verde indica que o veículo possui uma boa aceitação no mercado securitário. String

amarelo	A cor amarela indica que o veículo possui uma aceitação média no mercado securitário. String

vermelho	A cor vermelha indica que o veículo possui uma difícil aceitação no mercado securitário. String

Aviso

É importante ressaltar que essas classificações podem variar conforme os critérios internos de cada seguradora. Além das cores, os níveis de aceitação podem ser variáveis, como 100%, 90%, 80%, dependendo da avaliação específica de cada seguradora.

\# Resposta Requisição

Aviso

No bloco gravame, esta consulta retorna apenas uma mensagem de referência. Os dados detalhados de gravame são obtidos pelo produto Conferi Gravame, e seus campos podem ou não aparecer na resposta, dependendo dos dados retornados pelas bases consultadas.

Aviso

No exemplo de retorno abaixo, os blocos vendaDireta e eventoCorporativo aparecem juntos apenas para fins ilustrativos. Em uma resposta real, apenas um dos dois será retornado por consulta, conforme o tipo de evento encontrado para o veículo — são mutuamente exclusivos.

Aviso

O bloco alertaDeAcidente só é retornado na resposta quando há informação de acidente ou avarias para o veículo consultado. Caso não exista esse registro nas bases consultadas, o campo não aparecerá no retorno.

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <consultaPor>TIPO\_CONSULTA</consultaPor>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <Uf>UF\_VEICULO</Uf>

&#x20;       <UfDeOrigem>UF\_ORIGEM\_VEICULO</UfDeOrigem>

&#x20;       <uf\_faturado>UF\_FATURAMENTO\_VEICULO</uf\_faturado>

&#x20;       <municipio>MUNICIPIO\_VEICULO</municipio>

&#x20;       <tipoDocProprietario>TIPO\_DOC\_PROPRIETARIO</tipoDocProprietario>

&#x20;       <docProprietario>DOCUMENTO\_PROPRIETARIO</docProprietario>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <especie>ESPECIE\_VEICULO</especie>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <lotacao>LOTACAO\_VEICULO</lotacao>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;       <caixaCambio>CAIXA\_CAMBIO\_VEICULO</caixaCambio>

&#x20;       <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;       <montagem>MONTAGEM\_VEICULO</montagem>

&#x20;       <potencia>POTENCIA\_VEICULO</potencia>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA\_VEICULO</tipoCarroceria>

&#x20;       <cilindradas>CILINDRADAS\_VEICULO</cilindradas>

&#x20;       <numCarroceria>NUMERO\_CARROCERIA\_VEICULO</numCarroceria>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <tipoChassi>TIPO\_CHASSI\_VEICULO</tipoChassi>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO\_VEICULO</ultimaAtualizacao>

&#x20;       <tipoDocFaturado>TIPO\_DOC\_FATURADO\_VEICULO</tipoDocFaturado>

&#x20;       <docFaturado>DOCUMENTO\_FATURADO\_VEICULO</docFaturado>

&#x20;       <binMotor>BIN\_MOTOR\_VEICULO</binMotor>

&#x20;       <motorBusca>MOTOR\_BUSCA\_VEICULO</motorBusca>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA\_VEICULO</capacidadeCarga>

&#x20;       <eixoTraseiro>EIXO\_TRASEIRO\_VEICULO</eixoTraseiro>

&#x20;       <terceiroEixo>TERCEIRO\_EIXO\_VEICULO</terceiroEixo>

&#x20;       <eixos>NUMERO\_EIXOS\_VEICULO</eixos>

&#x20;       <tipoDocImportadora>TIPO\_DOC\_IMPORTADORA</tipoDocImportadora>

&#x20;       <identImportadora>IDENTIFICACAO\_IMPORTADORA</identImportadora>

&#x20;       <numeroDI>NUMERO\_DI\_VEICULO</numeroDI>

&#x20;       <dataRegistriDI>DATA\_REGISTRO\_DI\_VEICULO</dataRegistriDI>

&#x20;       <fabricante>FABRICANTE\_VEICULO</fabricante>

&#x20;       <segmento>SEGMENTO\_VEICULO</segmento>

&#x20;       <subSegmento>SUBSEGMENTO\_VEICULO</subSegmento>

&#x20;       <grupoModeloVeiculo>GRUPO\_MODELO\_VEICULO</grupoModeloVeiculo>

&#x20;       <DT\_LimiteRestricaoTrib>DATA\_LIMITE\_RESTRICAO\_TRIBUTARIA</DT\_LimiteRestricaoTrib>

&#x20;       <capMaximaTracao>CAPACIDADE\_MAXIMA\_TRACAO\_VEICULO</capMaximaTracao>

&#x20;       <pesoBrutoTotal>PESO\_BRUTO\_TOTAL\_VEICULO</pesoBrutoTotal>

&#x20;       <restricao1>RESTRICAO1\_VEICULO</restricao1>

&#x20;       <restricao2>RESTRICAO2\_VEICULO</restricao2>

&#x20;       <restricao3>RESTRICAO3\_VEICULO</restricao3>

&#x20;       <restricao4>RESTRICAO4\_VEICULO</restricao4>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO</ultimaAtualizacao>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <montagem>MONTAGEM\_VEICULO</montagem>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <lotacao>LOTACAO\_VEICULO</lotacao>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;       <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <municipio>MUNICIPIO\_VEICULO</municipio>

&#x20;       <numCarroceria>NUM\_CARROCERIA\_VEICULO</numCarroceria>

&#x20;       <caixaCambio>CAIXA\_CAMBIO\_VEICULO</caixaCambio>

&#x20;       <tipoChassi>TIPO\_CHASSI\_VEICULO</tipoChassi>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA\_VEICULO</capacidadeCarga>

&#x20;       <cilindradas>CILINDRADAS\_VEICULO</cilindradas>

&#x20;       <cmt>CMT\_VEICULO</cmt>

&#x20;       <pbt>PBT\_VEICULO</pbt>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA\_VEICULO</tipoCarroceria>

&#x20;       <potencia>POTENCIA\_VEICULO</potencia>

&#x20;       <docProprietario>DOC\_PROPRIETARIO</docProprietario>

&#x20;       <nomeProprietario>NOME\_PROPRIETARIO</nomeProprietario>

&#x20;       <identFaturado>IDENT\_FATURADO</identFaturado>

&#x20;       <Uf>UF\_VEICULO</Uf>

&#x20;       <especie>ESPECIE\_VEICULO</especie>

&#x20;       <numeroEixoAuxiliar>NUM\_EIXO\_AUXILIAR</numeroEixoAuxiliar>

&#x20;       <numeroEixoTraseiro>NUM\_EIXO\_TRASEIRO</numeroEixoTraseiro>

&#x20;       <numeroEixos>NUM\_EIXOS</numeroEixos>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <restricoes>RESTRICOES\_VEICULO</restricoes>

&#x20;       <restricao1>RESTRICAO1\_VEICULO</restricao1>

&#x20;       <restricao2>RESTRICAO2\_VEICULO</restricao2>

&#x20;       <restricao3>RESTRICAO3\_VEICULO</restricao3>

&#x20;       <restricao4>RESTRICAO4\_VEICULO</restricao4>

&#x20;       <restricaoRenajud>RENAJUD\_VEICULO</restricaoRenajud>

&#x20;       <restricaoRenainf>RENAINF\_VEICULO</restricaoRenainf>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <ocorrencias>OCORRENCIAS\_VEICULO</ocorrencias>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <retorno>

&#x20;           <Chassi>CHASSI\_VEICULO</Chassi>

&#x20;           <IdentificacaoCsv>ID\_CSV</IdentificacaoCsv>

&#x20;           <TipoCsv>TIPO\_CSV</TipoCsv>

&#x20;           <DataInspecao>DATA\_INSPECAO</DataInspecao>

&#x20;           <Proprietario>NOME\_PROPRIETARIO</Proprietario>

&#x20;           <Municipio>MUNICIPIO\_PROPRIETARIO</Municipio>

&#x20;           <ITL>ITL\_ORGANIZACAO</ITL>

&#x20;           <ITL\_CNPJ>CNPJ\_ITL</ITL\_CNPJ>

&#x20;           <Escopo>ESCOPO\_INSPECAO</Escopo>

&#x20;           <pdf\_path>LINK\_PDF\_CSV</pdf\_path>

&#x20;       </retorno>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>ALERTA\_CODIGO</alertaCodigo>

&#x20;       <alertaMensagem>ALERTA\_MENSAGEM</alertaMensagem>

&#x20;       <historico>

&#x20;           <rouboFurto>

&#x20;               <ocorrencia>OCORRENCIA\_STATUS</ocorrencia>

&#x20;               <orgaoSeguranca>ORGAO\_SEGURANCA</orgaoSeguranca>

&#x20;               <municipioEmplacamento>MUNICIPIO\_EMPLACAMENTO</municipioEmplacamento>

&#x20;               <municipioOcorrencia>MUNICIPIO\_OCORRENCIA</municipioOcorrencia>

&#x20;               <Ufocorrencia>UF\_OCORRENCIA</Ufocorrencia>

&#x20;               <anoBo>ANO\_BO</anoBo>

&#x20;               <dataOcorrencia>DATA\_OCORRENCIA</dataOcorrencia>

&#x20;               <numeroBo>NUMERO\_BO</numeroBo>

&#x20;               <placa>PLACA\_VEICULO</placa>

&#x20;               <chassi>CHASSI\_VEICULO</chassi>

&#x20;               <marca>MARCA\_VEICULO</marca>

&#x20;               <modelo>MODELO\_VEICULO</modelo>

&#x20;               <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;               <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;               <cor>COR\_VEICULO</cor>

&#x20;               <renavam>RENAVAM\_VEICULO</renavam>

&#x20;               <Uf>UF\_VEICULO</Uf>

&#x20;               <observacoes>OBSERVACOES</observacoes>

&#x20;               <informante>INFORMANTE</informante>

&#x20;               <documento>DOCUMENTO</documento>

&#x20;               <numeroDocumento>NUMERO\_DOCUMENTO</numeroDocumento>

&#x20;               <ramal>RAMAL</ramal>

&#x20;               <telefone>TELEFONE</telefone>

&#x20;           </rouboFurto>

&#x20;       </historico>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <codigoConsulta>CODIGO\_CONSULTA</codigoConsulta>

&#x20;       <dado>DADO\_VEICULO</dado>

&#x20;       <consultaPor>CONSULTA\_POR</consultaPor>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;       <anoModelo>ANO\_MODELO</anoModelo>

&#x20;       <categoria>CATEGORIA\_VEICULO</categoria>

&#x20;       <qtdPassageiros>QTD\_PASSAGEIROS</qtdPassageiros>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <municipio>MUNICIPIO</municipio>

&#x20;       <uf>UF\_VEICULO</uf>

&#x20;       <numCarroceria>NUM\_CARROCERIA</numCarroceria>

&#x20;       <caixaCambio>CAIXA\_CAMBIO</caixaCambio>

&#x20;       <tipoChassi>TIPO\_CHASSI</tipoChassi>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA</capacidadeCarga>

&#x20;       <cilindradas>CILINDRADAS</cilindradas>

&#x20;       <cmt>CMT</cmt>

&#x20;       <pbt>PBT</pbt>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA</tipoCarroceria>

&#x20;       <potencia>POTENCIA</potencia>

&#x20;       <tipoDocProprietario>TIPO\_DOC\_PROPRIETARIO</tipoDocProprietario>

&#x20;       <docProprietario>DOC\_PROPRIETARIO</docProprietario>

&#x20;       <proprietario>PROPRIETARIO\_VEICULO</proprietario>

&#x20;       <propriAnterior>PROPRIETARIO\_ANTERIOR</propriAnterior>

&#x20;       <uf\_faturado>UF\_FATURADO</uf\_faturado>

&#x20;       <comunicacaoVendaAtiva>COMUNICACAO\_VENDA\_ATIVA</comunicacaoVendaAtiva>

&#x20;       <dataTransferencia>DATA\_TRANSFERENCIA</dataTransferencia>

&#x20;       <comunicInclusao>COMUNIC\_INCLUSAO</comunicInclusao>

&#x20;       <tipoComprador>TIPO\_COMPRADOR</tipoComprador>

&#x20;       <docComprador>DOC\_COMPRADOR</docComprador>

&#x20;       <notaFiscal>NOTA\_FISCAL</notaFiscal>

&#x20;       <protocoloDetran>PROTOCOLO\_DETRAN</protocoloDetran>

&#x20;       <inspecaoAno>INSPECAO\_ANO</inspecaoAno>

&#x20;       <inspecaoCentro>INSPECAO\_CENTRO</inspecaoCentro>

&#x20;       <inspecaoData>INSPECAO\_DATA</inspecaoData>

&#x20;       <inspecaoSelo>INSPECAO\_SELO</inspecaoSelo>

&#x20;       <inspecaoStatus>INSPECAO\_STATUS</inspecaoStatus>

&#x20;       <codigoFinanceira>CODIGO\_FINANCEIRA</codigoFinanceira>

&#x20;       <dataInclusaoIntencaoTrocaFinanceira>DATA\_INCLUSAO\_INTENCAO</dataInclusaoIntencaoTrocaFinanceira>

&#x20;       <numeroContratoFinanceira>NUMERO\_CONTRATO\_FINANCEIRA</numeroContratoFinanceira>

&#x20;       <CodigoAgenteFinanceiro>CODIGO\_AGENTE\_FINANCEIRO</CodigoAgenteFinanceiro>

&#x20;       <dataVigenciaContratoFinanceira>DATA\_VIGENCIA\_FINANCEIRA</dataVigenciaContratoFinanceira>

&#x20;       <especie>ESPECIE</especie>

&#x20;       <tipo\_identFaturado>TIPO\_IDENT\_FATURADO</tipo\_identFaturado>

&#x20;       <identFaturado>IDENT\_FATURADO</identFaturado>

&#x20;       <identImportador>IDENT\_IMPORTADOR</identImportador>

&#x20;       <eixoAuxiliar>EIXO\_AUXILIAR</eixoAuxiliar>

&#x20;       <eixoTraseiro>EIXO\_TRASEIRO</eixoTraseiro>

&#x20;       <numeroEixos>NUMERO\_EIXOS</numeroEixos>

&#x20;       <restrTributaria>RESTRICAO\_TRIBUTARIA</restrTributaria>

&#x20;       <existeDebitoMulta>DEBITO\_MULTA</existeDebitoMulta>

&#x20;       <existeDebitoIPVA>DEBITO\_IPVA</existeDebitoIPVA>

&#x20;       <existeDebitoLicenciamento>DEBITO\_LICENCIAMENTO</existeDebitoLicenciamento>

&#x20;       <existeDebitoDpvat>DEBITO\_DPVAT</existeDebitoDpvat>

&#x20;       <licenciamento>ANO\_LICENCIAMENTO</licenciamento>

&#x20;       <dataLicenciamento>DATA\_LICENCIAMENTO</dataLicenciamento>

&#x20;       <debitoIpva>DEBITO\_IPVA\_VALOR</debitoIpva>

&#x20;       <debitoDpvat>DEBITO\_DPVAT\_VALOR</debitoDpvat>

&#x20;       <debitoLicenciamento>DEBITO\_LICENCIAMENTO\_VALOR</debitoLicenciamento>

&#x20;       <debitoMulta>DEBITO\_MULTA\_VALOR</debitoMulta>

&#x20;       <debitoMunicipais>DEBITO\_MUNICIPAIS\_VALOR</debitoMunicipais>

&#x20;       <infracaoRenainf>INFRACAO\_RENAINF\_VALOR</infracaoRenainf>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <dataEmissaoCRV>DATA\_EMISSAO\_CRV</dataEmissaoCRV>

&#x20;       <debitoDersa>DEBITO\_DERSA\_VALOR</debitoDersa>

&#x20;       <debitoDer>DEBITO\_DER\_VALOR</debitoDer>

&#x20;       <debitoDetran>DEBITO\_DETRAN\_VALOR</debitoDetran>

&#x20;       <debitoPoliciaRodoviaria>DEBITO\_POLICIA\_RODOVIARIA\_VALOR</debitoPoliciaRodoviaria>

&#x20;       <restricoes>RESTRICOES\_VEICULO</restricoes>

&#x20;       <restricoes\_01>RESTRICOES\_01</restricoes\_01>

&#x20;       <restricoes\_02>RESTRICOES\_02</restricoes\_02>

&#x20;       <restricoes\_03>RESTRICOES\_03</restricoes\_03>

&#x20;       <restricoes\_04>RESTRICOES\_04</restricoes\_04>

&#x20;       <restricoes\_05>RESTRICOES\_05</restricoes\_05>

&#x20;       <observacoes>OBSERVACOES</observacoes>

&#x20;       <restricoesRenajud>RESTRICOES\_RENAJUD</restricoesRenajud>

&#x20;       <restricaoFinanceira>RESTRICAO\_FINANCEIRA</restricaoFinanceira>

&#x20;       <restricaoAdm>RESTRICAO\_ADM</restricaoAdm>

&#x20;       <restricaoFurto>RESTRICAO\_FURTO</restricaoFurto>

&#x20;       <restricaoGuincho>RESTRICAO\_GUINCHO</restricaoGuincho>

&#x20;       <restricaoJudicial>RESTRICAO\_JUDICIAL</restricaoJudicial>

&#x20;       <restricaoAmbiental>RESTRICAO\_AMBIENTAL</restricaoAmbiental>

&#x20;       <restricaoNomeAgente>RESTRICAO\_NOME\_AGENTE</restricaoNomeAgente>

&#x20;       <restricaoArrendatario>RESTRICAO\_ARRENDATARIO</restricaoArrendatario>

&#x20;       <restricaoDataInclusao>RESTRICAO\_DATA\_INCLUSAO</restricaoDataInclusao>

&#x20;       <restricaoCPFCNPJARRENDATAR>RESTRICAO\_CPFCNPJ\_ARRENDATARIO</restricaoCPFCNPJARRENDATAR>

&#x20;       <intencaoRestricaoFinanceira>INTENCAO\_RESTRICAO\_FINANCEIRA</intencaoRestricaoFinanceira>

&#x20;       <outrasRestricoes>OUTRAS\_RESTRICOES</outrasRestricoes>

&#x20;       <estadual\_gravame\_codigoAgente>ESTADUAL\_GRAVAME\_CODIGO\_AGENTE</estadual\_gravame\_codigoAgente>

&#x20;       <estadual\_gravame\_data>ESTADUAL\_GRAVAME\_DATA</estadual\_gravame\_data>

&#x20;       <estadual\_gravame\_vigencia\_contrato>ESTADUAL\_GRAVAME\_VIGENCIA\_CONTRATO</estadual\_gravame\_vigencia\_contrato>

&#x20;       <estadual\_gravame\_documento\_financiado>ESTADUAL\_GRAVAME\_DOCUMENTO\_FINANCIADO</estadual\_gravame\_documento\_financiado>

&#x20;       <estadual\_gravame\_nome\_agente>ESTADUAL\_GRAVAME\_NOME\_AGENTE</estadual\_gravame\_nome\_agente>

&#x20;       <estadual\_gravame\_numero\_contrato>ESTADUAL\_GRAVAME\_NUMERO\_CONTRATO</estadual\_gravame\_numero\_contrato>

&#x20;       <estadual\_gravame\_restricao\_financeira>ESTADUAL\_GRAVAME\_RESTRICAO\_FINANCEIRA</estadual\_gravame\_restricao\_financeira>

&#x20;       <estadual\_intencao\_gravame\_agente>ESTADUAL\_INTENCAO\_GRAVAME\_AGENTE</estadual\_intencao\_gravame\_agente>

&#x20;       <estadual\_intencao\_gravame\_data\_inclusao>ESTADUAL\_INTENCAO\_GRAVAME\_DATA\_INCLUSAO</estadual\_intencao\_gravame\_data\_inclusao>

&#x20;       <estadual\_intencao\_gravame\_documento\_financiado>

&#x20;           ESTADUAL\_INTENCAO\_GRAVAME\_DOCUMENTO\_FINANCIADO</estadual\_intencao\_gravame\_documento\_financiado>

&#x20;       <estadual\_intencao\_gravame\_nome\_financiado>ESTADUAL\_INTENCAO\_GRAVAME\_NOME\_FINANCIADO</estadual\_intencao\_gravame\_nome\_financiado>

&#x20;       <estadual\_intencao\_gravame\_restricao\_financeira>

&#x20;           ESTADUAL\_INTENCAO\_GRAVAME\_RESTRICAO\_FINANCEIRA</estadual\_intencao\_gravame\_restricao\_financeira>

&#x20;       <intencaoNomeAgente>INTENCAO\_NOME\_AGENTE</intencaoNomeAgente>

&#x20;       <intencaoNomeFinanceira>INTENCAO\_NOME\_FINANCEIRA</intencaoNomeFinanceira>

&#x20;       <intencaoCPFCNPJFinanceira>INTENCAO\_CPFCNPJ\_FINANCEIRA</intencaoCPFCNPJFinanceira>

&#x20;       <intencaoDataInclusao>INTENCAO\_DATA\_INCLUSAO</intencaoDataInclusao>

&#x20;       <debcetesb>DEBCTESB\_VALOR</debcetesb>

&#x20;       <licexelic>LICEXELIC</licexelic>

&#x20;       <dataLimiteRestricaoTributaria>DATA\_LIMITE\_RESTRICAO\_TRIBUTARIA</dataLimiteRestricaoTributaria>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO</ultimaAtualizacao>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <Placa>PLACA\_VEICULO</Placa>

&#x20;       <Chassi>CHASSI\_VEICULO</Chassi>

&#x20;       <TipoVeiculo>TIPO\_VEICULO</TipoVeiculo>

&#x20;       <Fabricante>FABRICANTE\_VEICULO</Fabricante>

&#x20;       <AnoFab>ANO\_FABRICACAO</AnoFab>

&#x20;       <AnoMod>ANO\_MODELO</AnoMod>

&#x20;       <Combustivel>COMBUSTIVEL\_VEICULO</Combustivel>

&#x20;       <QtdEixos>QUANTIDADE\_EIXOS</QtdEixos>

&#x20;       <Carroceria>TIPO\_CARROCERIA</Carroceria>

&#x20;       <Regiao>REGIAO\_VEICULO</Regiao>

&#x20;       <Pais>PAIS\_ORIGEM</Pais>

&#x20;       <LocalFabricacao>LOCAL\_FABRICACAO</LocalFabricacao>

&#x20;       <Marca>MARCA\_VEICULO</Marca>

&#x20;       <ModeloCompleto>MODELO\_COMPLETO</ModeloCompleto>

&#x20;       <Modelo>MODELO\_VEICULO</Modelo>

&#x20;       <Versao>VERSAO\_VEICULO</Versao>

&#x20;       <Motor>MOTOR\_VEICULO</Motor>

&#x20;       <TipoMotor>TIPO\_MOTOR</TipoMotor>

&#x20;       <Tracao>TRACAO\_VEICULO</Tracao>

&#x20;       <Transmissao>TRANSMISSAO\_VEICULO</Transmissao>

&#x20;       <Portas>QUANTIDADE\_PORTAS</Portas>

&#x20;       <Classificacao>CLASSIFICACAO\_VEICULO</Classificacao>

&#x20;       <Comprimento>COMPRIMENTO\_VEICULO</Comprimento>

&#x20;       <MesProducao>MES\_PRODUCAO</MesProducao>

&#x20;       <PesoBruto>PESO\_BRUTO</PesoBruto>

&#x20;       <Freio>TIPO\_FREIO</Freio>

&#x20;       <DistanciaEixos>DISTANCIA\_EIXOS</DistanciaEixos>

&#x20;       <CodigoFipe>CODIGO\_FIPE</CodigoFipe>

&#x20;       <DigitoVerificador>DIGITO\_VERIFICADOR</DigitoVerificador>

&#x20;       <VerificaSerial>VERIFICA\_SERIAL</VerificaSerial>

&#x20;       <Conclusao>STATUS\_CONCLUSAO</Conclusao>

&#x20;       <QuantidadeIrregularidades>QTD\_IRREGULARIDADES</QuantidadeIrregularidades>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>INFORMACOES\_GRAVAME</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <resposta>RESPOSTA\_SINISTRO</resposta>

&#x20;       <mensagem>DESCRICAO\_SINISTRO</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <resposta>INDICIO\_SINISTRO</resposta>

&#x20;       <mensagem>DESCRICAO\_INDICIO\_SINISTRO</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2>

&#x20;       <codigo>1</codigo>

&#x20;       <mensagem>VEÍCULO COM ACIONAMENTO DE SEGURO SEM INDENIZAÇÃO INTEGRAL</mensagem>

&#x20;   </indicioSinistro2>

&#x20;   <parecerTecnico>

&#x20;       <cor>COR\_PARECER</cor>

&#x20;   </parecerTecnico>

&#x20;   <alertaDeAcidente>

&#x20;       <mensagem>Encontrado alerta de acidente ou avarias</mensagem>

&#x20;   </alertaDeAcidente>

&#x20;   <leilao>

&#x20;       <leiloes>

&#x20;           <leilao>

&#x20;               <placa>PLACA\_EXEMPLO</placa>

&#x20;               <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;               <leiloeiro>LEILOEIRO\_EXEMPLO</leiloeiro>

&#x20;               <comitente>COMITENTE\_EXEMPLO</comitente>

&#x20;               <lote>LOTE\_EXEMPLO</lote>

&#x20;               <dataLeilao>DATA\_LEILAO\_EXEMPLO</dataLeilao>

&#x20;               <patio>PATIO\_EXEMPLO</patio>

&#x20;               <idLeilao>ID\_LEILAO\_EXEMPLO</idLeilao>

&#x20;               <anoFabricacao>ANO\_FABRICACAO\_EXEMPLO</anoFabricacao>

&#x20;               <anoModelo>ANO\_MODELO\_EXEMPLO</anoModelo>

&#x20;               <marca>MARCA\_EXEMPLO</marca>

&#x20;               <modelo>MODELO\_EXEMPLO</modelo>

&#x20;               <cor>COR\_EXEMPLO</cor>

&#x20;               <nr\_motor>MOTOR\_EXEMPLO</nr\_motor>

&#x20;               <qtd\_eixos>QUANTIDADE\_EIXOS\_EXEMPLO</qtd\_eixos>

&#x20;               <combustivel>COMBUSTIVEL\_EXEMPLO</combustivel>

&#x20;               <categoriaDoVeiculo>CATEGORIA\_VEICULO\_EXEMPLO</categoriaDoVeiculo>

&#x20;               <obs>OBSERVACOES</obs>

&#x20;           </leilao>

&#x20;       </leiloes>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <constaVendaDireta>true</constaVendaDireta>

&#x20;       <mensagem>Consta venda direta</mensagem>

&#x20;       <fotos>URL\_FOTO\_1</fotos>

&#x20;       <fotos>URL\_FOTO\_2</fotos>

&#x20;       <fotos>URL\_FOTO\_3</fotos>

&#x20;       <fotos>URL\_FOTO\_4</fotos>

&#x20;       <checklist>

&#x20;           <dataInspecao/>

&#x20;           <motor/>

&#x20;           <portamalas/>

&#x20;           <frente/>

&#x20;           <frenteDireita/>

&#x20;           <frenteEsquerda/>

&#x20;           <portaFrenteDireita/>

&#x20;           <portaFrenteEsquerda/>

&#x20;           <portaTraseiraDireita/>

&#x20;           <portaTraseiraEsquerda/>

&#x20;           <traseiraDireita/>

&#x20;           <traseiraEsquerda/>

&#x20;           <ladoDireito/>

&#x20;           <ladoEsquerdo/>

&#x20;           <pneuFrenteDireita/>

&#x20;           <pneuFrenteEsquerda/>

&#x20;           <pneuTraseiraDireita/>

&#x20;           <traseira/>

&#x20;           <cacamba/>

&#x20;           <bancosDianteiros/>

&#x20;           <bancosTraseiros/>

&#x20;           <forroTeto/>

&#x20;           <teto/>

&#x20;           <carenagemDianteira/>

&#x20;           <carenagemDireita/>

&#x20;           <carenagemEsquerda/>

&#x20;           <tanqueCombustivel/>

&#x20;           <obs/>

&#x20;           <link1/>

&#x20;           <link2/>

&#x20;           <garantia/>

&#x20;       </checklist>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <constaEventoCorporativo>true</constaEventoCorporativo>

&#x20;       <mensagem>Consta evento corporativo</mensagem>

&#x20;       <fotos>URL\_FOTO\_1</fotos>

&#x20;       <fotos>URL\_FOTO\_2</fotos>

&#x20;       <fotos>URL\_FOTO\_3</fotos>

&#x20;       <fotos>URL\_FOTO\_4</fotos>

&#x20;       <checklist>

&#x20;           <dataInspecao/>

&#x20;           <motor/>

&#x20;           <portamalas/>

&#x20;           <frente/>

&#x20;           <frenteDireita/>

&#x20;           <frenteEsquerda/>

&#x20;           <portaFrenteDireita/>

&#x20;           <portaFrenteEsquerda/>

&#x20;           <portaTraseiraDireita/>

&#x20;           <portaTraseiraEsquerda/>

&#x20;           <traseiraDireita/>

&#x20;           <traseiraEsquerda/>

&#x20;           <ladoDireito/>

&#x20;           <ladoEsquerdo/>

&#x20;           <pneuFrenteDireita/>

&#x20;           <pneuFrenteEsquerda/>

&#x20;           <pneuTraseiraDireita/>

&#x20;           <traseira/>

&#x20;           <cacamba/>

&#x20;           <bancosDianteiros/>

&#x20;           <bancosTraseiros/>

&#x20;           <forroTeto/>

&#x20;           <teto/>

&#x20;           <carenagemDianteira/>

&#x20;           <carenagemDireita/>

&#x20;           <carenagemEsquerda/>

&#x20;           <tanqueCombustivel/>

&#x20;           <obs/>

&#x20;           <link1/>

&#x20;           <link2/>

&#x20;           <garantia/>

&#x20;       </checklist>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <proprietario>

&#x20;           <nomeProprietario>NOME\_PROPRIETARIO\_EXEMPLO</nomeProprietario>

&#x20;           <documento>DOCUMENTO\_EXEMPLO</documento>

&#x20;           <placa>PLACA\_EXEMPLO</placa>

&#x20;           <ano>ANO\_EXEMPLO</ano>

&#x20;           <uf>UF\_EXEMPLO</uf>

&#x20;       </proprietario>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <precificador>

&#x20;           <Valor>VALOR\_EXEMPLO</Valor>

&#x20;           <Marca>MARCA\_EXEMPLO</Marca>

&#x20;           <Modelo>MODELO\_EXEMPLO</Modelo>

&#x20;           <AnoModelo>ANO\_MODELO\_EXEMPLO</AnoModelo>

&#x20;           <Combustivel>COMBUSTIVEL\_EXEMPLO</Combustivel>

&#x20;           <CodigoFipe>CÓDIGO\_FIPE\_EXEMPLO</CodigoFipe>

&#x20;           <MesReferencia>MÊS\_REFERÊNCIA\_EXEMPLO</MesReferencia>

&#x20;           <Autenticacao>AUTENTICAÇÃO\_EXEMPLO</Autenticacao>

&#x20;           <TipoVeiculo>TIPO\_VEICULO\_EXEMPLO</TipoVeiculo>

&#x20;           <SiglaCombustivel>SIGLA\_COMBUSTIVEL\_EXEMPLO</SiglaCombustivel>

&#x20;           <DataConsulta>DATA\_CONSULTA\_EXEMPLO</DataConsulta>

&#x20;           <Historicos>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;           </Historicos>

&#x20;           <resumo>

&#x20;               <valor\_inicial>0</valor\_inicial>

&#x20;               <valor\_final>0</valor\_final>

&#x20;               <variacao\_acumulada\_nominal>0</variacao\_acumulada\_nominal>

&#x20;               <variacao\_acumulada\_percentual>0</variacao\_acumulada\_percentual>

&#x20;               <anos\_analisados>0</anos\_analisados>

&#x20;               <anos\_indisponiveis>0</anos\_indisponiveis>

&#x20;           </resumo>

&#x20;       </precificador>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <montadora>

&#x20;           <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;           <montadora>MONTADORA\_EXEMPLO</montadora>

&#x20;           <modelo>MODELO\_EXEMPLO</modelo>

&#x20;       </montadora>

&#x20;       <ocorrencias>

&#x20;           <ocorrencia>

&#x20;               <identificador>IDENTIFICADOR\_EXEMPLO</identificador>

&#x20;               <descricao>DESCRIÇÃO\_EXEMPLO</descricao>

&#x20;               <data\_registro>DATA\_REGISTRO\_EXEMPLO</data\_registro>

&#x20;           </ocorrencia>

&#x20;       </ocorrencias>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <ocorrencias>

&#x20;           <numeroInfracao>NUMERO\_INFRACAO\_EXEMPLO</numeroInfracao>

&#x20;           <detalhesInfracao>DETALHES\_INFRACAO\_EXEMPLO</detalhesInfracao>

&#x20;           <localInfracao>LOCAL\_INFRACAO\_EXEMPLO</localInfracao>

&#x20;           <detalheNumeroAutoInfracao>DETALHE\_NUMERO\_AUTO\_INFRACAO\_EXEMPLO</detalheNumeroAutoInfracao>

&#x20;           <detalheOrgaoAutuador>DETALHE\_ORGAO\_AUTUADOR\_EXEMPLO</detalheOrgaoAutuador>

&#x20;           <dataInfracao>DATA\_INFRACAO\_EXEMPLO</dataInfracao>

&#x20;           <horaInfracao>HORA\_INFRACAO\_EXEMPLO</horaInfracao>

&#x20;           <exigibilidade>EXIGIBILIDADE\_EXEMPLO</exigibilidade>

&#x20;           <codigoInfracao>CODIGO\_INFRACAO\_EXEMPLO</codigoInfracao>

&#x20;           <orgaoAutuador>ORGÃO\_AUTUADOR\_EXEMPLO</orgaoAutuador>

&#x20;           <dataCadastro>DATA\_CADASTRO\_EXEMPLO</dataCadastro>

&#x20;           <dataEmissaoPenalidade>DATA\_EMISSAO\_PENALIDADE\_EXEMPLO</dataEmissaoPenalidade>

&#x20;           <dataNotificacaoInfracao>DATA\_NOTIFICACAO\_INFRACAO\_EXEMPLO</dataNotificacaoInfracao>

&#x20;           <placa>PLACA\_EXEMPLO</placa>

&#x20;           <ufPlaca>UF\_PLACA\_EXEMPLO</ufPlaca>

&#x20;           <ufJurisdicao>UF\_JURISDICAO\_EXEMPLO</ufJurisdicao>

&#x20;           <limitePermitido>LIMITES\_PERMITIDO\_EXEMPLO</limitePermitido>

&#x20;           <medicaoConsiderada>MEDICAO\_CONSIDERADA\_EXEMPLO</medicaoConsiderada>

&#x20;           <medicaoReal>MEDICAO\_REAL\_EXEMPLO</medicaoReal>

&#x20;           <valorInfracao>VALOR\_INFRACAO\_EXEMPLO</valorInfracao>

&#x20;           <dataPagamento>DATA\_PAGAMENTO\_EXEMPLO</dataPagamento>

&#x20;           <dataRegistroPagamento>DATA\_REGISTRO\_PAGAMENTO\_EXEMPLO</dataRegistroPagamento>

&#x20;           <ufPagamento>UF\_PAGAMENTO\_EXEMPLO</ufPagamento>

&#x20;           <valorPago>VALOR\_PAGO\_EXEMPLO</valorPago>

&#x20;       </ocorrencias>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <quantidadeRegistros>QUANTIDADE\_REGISTROS\_EXEMPLO</quantidadeRegistros>

&#x20;       <duplicidades>

&#x20;           <duplicidade>

&#x20;               <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;               <placa>PLACA\_EXEMPLO</placa>

&#x20;               <motor>MOTOR\_EXEMPLO</motor>

&#x20;           </duplicidade>

&#x20;       </duplicidades>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <quantidadeRegistros>QUANTIDADE\_REGISTROS\_EXEMPLO</quantidadeRegistros>

&#x20;       <desvalorizacoes>

&#x20;           <desvalorizacao>

&#x20;               <valorAno>VALOR\_ANO\_EXEMPLO</valorAno>

&#x20;               <porcentagemRelativaAnoAnterior>PERCENTAGEM\_RELATIVA\_ANO\_ANTERIOR\_EXEMPLO</porcentagemRelativaAnoAnterior>

&#x20;               <porcentagemRelativaValorInicial>PERCENTAGEM\_RELATIVA\_VALOR\_INICIAL\_EXEMPLO</porcentagemRelativaValorInicial>

&#x20;               <codigoFipe>CODIGO\_FIPE\_EXEMPLO</codigoFipe>

&#x20;               <anoModelo>ANO\_MODELO\_EXEMPLO</anoModelo>

&#x20;               <anoReferencia>ANO\_REFERENCIA\_EXEMPLO</anoReferencia>

&#x20;           </desvalorizacao>

&#x20;       </desvalorizacoes>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comercializacao>

&#x20;       <resposta>1</resposta>

&#x20;       <mensagem>CONSTA COMERCIALIZAÇÃO</mensagem>

&#x20;   </comercializacao>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Consta comunicacao de venda</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Existe dívida ativa do proprietário</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>HASH\_PESQUISA</hashPesquisa>

</conferi>

Importante

As seções historico e resumo dentro do bloco precificador só são retornadas nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

Importante

O bloco comunicacaoVenda só é retornado nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

\# Detran

O bloco detran traz as informações do Detran da UF do veículo. Para algumas UFs será apresentado o site do Detran para consulta e, em outras, poderá haver indisponibilidade. Em caso de sucesso, são retornados os dados do veículo.



Importante

O bloco detran só é retornado nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

Sucesso: Retorno com os dados do Detran da UF do veículo. As informações do exemplo são fictícias, apenas para teste.



Sucesso

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <informacoesVeiculo>

&#x20;           <renavam>RENAVAM</renavam>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <placa>PLACA</placa>

&#x20;           <marcaModelo>MARCA/MODELO</marcaModelo>

&#x20;           <municipio>MUNICIPIO</municipio>

&#x20;           <anoFabricacaoModelo>AAAA / AAAA</anoFabricacaoModelo>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <cor>COR</cor>

&#x20;           <categoria>CATEGORIA</categoria>

&#x20;           <especieTipo>ESPECIE / TIPO</especieTipo>

&#x20;           <situacaoVeiculo>SITUACAO DO VEICULO</situacaoVeiculo>

&#x20;           <restricaoVenda>RESTRICAO A VENDA</restricaoVenda>

&#x20;       </informacoesVeiculo>

&#x20;       <debitos>

&#x20;           <ipva>

&#x20;               <totalDebitos>2.318,47</totalDebitos>

&#x20;           </ipva>

&#x20;           <dpvat>TESTE - NÃO HÁ DEBITOS DE SEGURO OBRIGATÓRIO - DPVAT</dpvat>

&#x20;           <taxaLicenciamento>137,26</taxaLicenciamento>

&#x20;           <vencimentoLicenciamento>TESTE - Vencimento em 14/08/2026</vencimentoLicenciamento>

&#x20;       </debitos>

&#x20;       <multas>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM PROCESSO DE RECURSO OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM DIVIDA ATIVA/EXEC.JUDICIAL/SOB JUDICE</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>3</quantidade>

&#x20;               <valor>R$ 587,19</valor>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM PROCESSO DE RECURSO NÃO OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS IMPOSTAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <total>R$ 587,19</total>

&#x20;       </multas>

&#x20;       <autuacoes>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES NOTIFICADAS</discriminacao>

&#x20;               <quantidade>1</quantidade>

&#x20;               <valor>R$ 241,83</valor>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES EM PROCESSO DE DEFESA</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES EM PROCESSO DE NOTIFICAÇÃO</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <total>R$ 241,83</total>

&#x20;       </autuacoes>

&#x20;       <odometro>

&#x20;           <mensagem/>

&#x20;           <historico>

&#x20;               <titulo>TESTE - AQUISICAO DE VEICULO</titulo>

&#x20;               <data>05/03/2026</data>

&#x20;               <hodometro>84.312 km</hodometro>

&#x20;           </historico>

&#x20;           <historico>

&#x20;               <titulo>TESTE - PRIMEIRO EMPLACAMENTO</titulo>

&#x20;               <data>18/09/2021</data>

&#x20;               <hodometro>7 km</hodometro>

&#x20;           </historico>

&#x20;           <ultimoRegistro>

&#x20;               <numeroProcesso>531.7.2846193-4</numeroProcesso>

&#x20;               <motivo>TESTE - AQUISICAO DE VEICULO</motivo>

&#x20;               <data>05/03/2026</data>

&#x20;               <valorOdometro>84.312 km</valorOdometro>

&#x20;           </ultimoRegistro>

&#x20;       </odometro>

&#x20;       <crlv>

&#x20;           <licenciamento>TESTE - LICENCIAMENTO ANUAL QUITADO</licenciamento>

&#x20;           <exercicio>2026</exercicio>

&#x20;           <dataPagamento>22/04/2026</dataPagamento>

&#x20;           <valorPago>R$ 158,74</valorPago>

&#x20;           <emissaoDocumento>24/04/2026</emissaoDocumento>

&#x20;           <dataPostagem>27/04/2026</dataPostagem>

&#x20;           <numeroCorreios>TESTE - Origem: PROCESSO 531.7.2846193-4</numeroCorreios>

&#x20;       </crlv>

&#x20;       <csv>

&#x20;           <ano>2019</ano>

&#x20;           <numeroCsv>608241957</numeroCsv>

&#x20;           <discriminacao>TESTE - LIBERACAO POR ACIDENTE</discriminacao>

&#x20;       </csv>

&#x20;       <recall>

&#x20;           <nomeRecall>TESTE - Airbag lado motorista</nomeRecall>

&#x20;           <descricaoDefeito>TESTE - Airbag lado motorista</descricaoDefeito>

&#x20;           <identificadorRecall>TST2021004</identificadorRecall>

&#x20;           <dataUltimaAtualizacao>16/02/2023</dataUltimaAtualizacao>

&#x20;           <dataInicio>11/06/2021</dataInicio>

&#x20;           <dataLimiteAtendimento>10/06/2022</dataLimiteAtendimento>

&#x20;       </recall>

&#x20;   </detran>

&#x20;   ...

</conferi>

Consultar site: Informa o site do Detran da UF do veículo para consulta.



Consultar site

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <situacao>Consultar site</situacao>

&#x20;       <url>URL</url>

&#x20;   </detran>

&#x20;   ...

</conferi>

Sistema Indisponível: O Detran da UF do veículo está indisponível.



Sistema Indisponível

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </detran>

&#x20;   ...

</conferi>

Sites do Detran informados no campo url, por UF:



UF	Link

AC	https://www.ac.getran.com.br/site/apps/veiculo/consulta/filtro-consulta-veiculo.jsp

AL	https://www.detran.al.gov.br/veiculos/consulta-veiculo/menu\_lateral

AM	https://digital.detran.am.gov.br/?openModalVeiculo=%2Fveiculo

AP	https://www.detran.ap.gov.br/detranap/veiculo/consulta-de-veiculos/

BA	https://servicos.detran.ba.gov.br/

CE	https://sistemas.detran.ce.gov.br/meudetran/

DF	https://portal.detran.df.gov.br/#/home

ES	https://detran.es.gov.br/veiculos

GO	https://www.go.gov.br/servicos/servico/consultar-veiculo--ipva-multas-e-crlv

MA	https://portal.detrannet.detran.ma.gov.br/Veiculo/Veiculos.cshtml

MG	https://transito.mg.gov.br/veiculos/situacao-do-veiculo/consulta-de-situacao-do-veiculo

MS	https://www.meudetran.ms.gov.br/veiculo.php#

MT	https://www.detran.mt.gov.br/

PA	https://www.detran.pa.gov.br/sistransito/detran-web/servicos/veiculos/indexRenavam.jsf

PB	https://wsdetran.pb.gov.br/detran-portal-servicos/servlet/easynat-app?op=S30

PE	https://www.detran.pe.gov.br/veiculos

PI	http://taxas.detran.pi.gov.br/licenciamento/index.jsf

PR	https://www.extratodebito.detran.pr.gov.br/detranextratos/geraExtrato.do?action=iniciarProcesso

RJ	https://www.detran.rj.gov.br/consultas/consultas-drv/nada-consta.html

RN	https://www2.detran.rn.gov.br/externo/consultarveiculo.asp

RS	https://pcsdetran.rs.gov.br/login?redirectUrl=%2Fconsulta-veiculo

RO	https://centralservicos.detran.ro.gov.br/consulta/veiculo

RR	https://www.rr.getran.com.br/site/apps/veiculo/filtroplacarenavam-consultaveiculo.jsp

SC	https://www.detran.sc.gov.br/veiculos/consultas/

SE	https://www.detran.se.gov.br/portal/?pg=cons\_veiculo

SP	https://www.detran.sp.gov.br/wps/portal/portaldetran/cidadao/home

TO	https://www.to.gov.br/detran/veiculos

\# Nenhum Registro Encontrado

O retorno de nenhum registro encontrado descreve que o veículo não foi encontrado nas bases consultadas.



Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>0</alertaCodigo>

&#x20;       <alertaMensagem>VEÍCULO NÃO POSSUÍ HISTÓRICO DE ROUBO E FURTO</alertaMensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <resposta>NAO</resposta>

&#x20;       <mensagem>NAO EXISTE SINISTRO DE INDENIZAÇÃO INTEGRAL</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <resposta>0</resposta>

&#x20;       <mensagem>Não existe indício de sinistro</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2>

&#x20;       <codigo>0</codigo>

&#x20;       <mensagem>Nao Consta</mensagem>

&#x20;   </indicioSinistro2>

&#x20;   <parecerTecnico>

&#x20;       <cor>verde</cor>

&#x20;   </parecerTecnico>

&#x20;   <leilao>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <Mensagem>Recall não encontrado</Mensagem>

&#x20;       <Mensagem2>O veículo pesquisado não possui Recall pendente ou não pertence a nenhum Recall

&#x20;           divulgado pelas montadoras a partir de 17/03/2011. Para períodos anteriores, entre em

&#x20;           contato diretamente com o fabricante do veículo.</Mensagem2>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comercializacao>

&#x20;       <resposta>0</resposta>

&#x20;       <mensagem>Não Consta</mensagem>

&#x20;   </comercializacao>

&#x20;   <scpc>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </scpc>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Não consta comunicacao de venda</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Não localizado dívida ativa do proprietário</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>

&#x20;       HASH\_PESQUISA

&#x20;   </hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <agregados>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2/>

&#x20;   <parecerTecnico>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </parecerTecnico>

&#x20;   <leilao>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>HASH\_PESQUISA</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}









\-------------------------------------



BASE BIN + rf



Conferi Base Bin + RF

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-bin?responseType=xml

\# Método da Requisição

A requisição para o endpoint do produto Conferi Base Bin + RF deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-bin/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-bin/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que pode conter um dos seguintes campos: placa ou chassi.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "AAA9999"

&#x20; }

}

\# Resposta Requisição Com Registro De Roubo e Furto

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <bin>

&#x20;       <placa>XXX0000</placa>

&#x20;       <ultimaAtualizacao />

&#x20;       <tipoVeiculo>TIPO\_VEICULO\_GENÉRICO</tipoVeiculo>

&#x20;       <marca>MARCA\_GENÉRICA</marca>

&#x20;       <modelo>MODELO\_GENÉRICO</modelo>

&#x20;       <montagem />

&#x20;       <motor>MOTOR\_GENÉRICO</motor>

&#x20;       <lotacao />

&#x20;       <cor>COR\_GENÉRICA</cor>

&#x20;       <anoFabricacao>AAAA</anoFabricacao>

&#x20;       <anoModelo>AAAA</anoModelo>

&#x20;       <combustivel>COMBUSTÍVEL\_GENÉRICO</combustivel>

&#x20;       <municipio>MUNICÍPIO\_GENÉRICO</municipio>

&#x20;       <numCarroceria />

&#x20;       <caixaCambio />

&#x20;       <tipoChassi>TIPO\_CHASSI\_GENÉRICO</tipoChassi>

&#x20;       <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;       <renavam>XXXXXXXXXXX</renavam>

&#x20;       <capacidadeCarga>VALOR\_GENÉRICO</capacidadeCarga>

&#x20;       <cilindradas>0000</cilindradas>

&#x20;       <cmt>VALOR\_GENÉRICO</cmt>

&#x20;       <pbt>VALOR\_GENÉRICO</pbt>

&#x20;       <tipoCarroceria />

&#x20;       <potencia>000</potencia>

&#x20;       <docProprietario />

&#x20;       <nomeProprietario />

&#x20;       <identFaturado>XXXXXXXXXXXXXX</identFaturado>

&#x20;       <Uf>XX</Uf>

&#x20;       <especie>ESPÉCIE\_GENÉRICA</especie>

&#x20;       <numeroEixoAuxiliar />

&#x20;       <numeroEixoTraseiro />

&#x20;       <numeroEixos />

&#x20;       <procedencia>PROCEDÊNCIA\_GENÉRICA</procedencia>

&#x20;       <restricoes>RESTRIÇÃO\_GENÉRICA</restricoes>

&#x20;       <restricao1>NADA CONSTA</restricao1>

&#x20;       <restricao2>NADA CONSTA</restricao2>

&#x20;       <restricao3>NADA CONSTA</restricao3>

&#x20;       <restricao4>NADA CONSTA</restricao4>

&#x20;       <restricaoRenajud>NADA CONSTA</restricaoRenajud>

&#x20;       <restricaoRenainf />

&#x20;       <situacao>SITUAÇÃO\_GENÉRICA</situacao>

&#x20;       <ocorrencias>VEÍCULO NÃO POSSUI OCORRÊNCIA DE ROUBO E FURTO</ocorrencias>

&#x20;   </bin>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>1</alertaCodigo>

&#x20;       <alertaMensagem>VEÍCULO POSSUI HISTÓRICO DE ROUBO E FURTO</alertaMensagem>

&#x20;       <historico>

&#x20;           <rouboFurto>

&#x20;               <ocorrencia>Alerta de Roubo/Furto</ocorrencia>

&#x20;               <orgaoSeguranca>000</orgaoSeguranca>

&#x20;               <municipioEmplacamento>MUNICÍPIO\_GENÉRICO</municipioEmplacamento>

&#x20;               <municipioOcorrencia>MUNICÍPIO\_GENÉRICO</municipioOcorrencia>

&#x20;               <Ufocorrencia>XX</Ufocorrencia>

&#x20;               <anoBo>DD/MM/AAAA</anoBo>

&#x20;               <dataOcorrencia>DD/MM/AAAA</dataOcorrencia>

&#x20;               <numeroBo>NUMERO\_GENÉRICO</numeroBo>

&#x20;               <placa>XXX0000</placa>

&#x20;               <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;               <marca>MARCA\_GENÉRICA</marca>

&#x20;               <modelo>MODELO\_GENÉRICO</modelo>

&#x20;               <anoFabricacao>AAAA</anoFabricacao>

&#x20;               <anoModelo>AAAA</anoModelo>

&#x20;               <cor>COR\_GENÉRICA</cor>

&#x20;               <renavam>XXXXXXXXXXX</renavam>

&#x20;               <Uf>XX</Uf>

&#x20;               <observacoes />

&#x20;               <informante>INFORMANTE\_GENÉRICO</informante>

&#x20;               <documento>XXXXXXXXXXX</documento>

&#x20;               <numeroDocumento>XXXXXXXXXXX</numeroDocumento>

&#x20;               <ramal>000</ramal>

&#x20;               <telefone>XX XXXXXXXX</telefone>

&#x20;           </rouboFurto>

&#x20;       </historico>

&#x20;   </historicoRouboFurto>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Resposta Requisição Sem Registro De Roubo e Furto

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <bin>

&#x20;       <placa>AAA9999</placa>

&#x20;       <ultimaAtualizacao />

&#x20;       <tipoVeiculo>TIPO\_VEICULO\_GENÉRICO</tipoVeiculo>

&#x20;       <marca>MARCA\_GENÉRICA</marca>

&#x20;       <modelo>MODELO\_GENÉRICO</modelo>

&#x20;       <montagem />

&#x20;       <motor>MOTOR\_GENÉRICO</motor>

&#x20;       <lotacao>VALOR\_GENÉRICO</lotacao>

&#x20;       <cor>COR\_GENÉRICA</cor>

&#x20;       <anoFabricacao>AAAA</anoFabricacao>

&#x20;       <anoModelo>AAAA</anoModelo>

&#x20;       <combustivel>COMBUSTÍVEL\_GENÉRICO</combustivel>

&#x20;       <municipio>MUNICÍPIO\_GENÉRICO</municipio>

&#x20;       <numCarroceria />

&#x20;       <caixaCambio />

&#x20;       <tipoChassi>TIPO\_CHASSI\_GENÉRICO</tipoChassi>

&#x20;       <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;       <renavam>XXXXXXXXXXX</renavam>

&#x20;       <capacidadeCarga>VALOR\_GENÉRICO</capacidadeCarga>

&#x20;       <cilindradas>0000</cilindradas>

&#x20;       <cmt>VALOR\_GENÉRICO</cmt>

&#x20;       <pbt>VALOR\_GENÉRICO</pbt>

&#x20;       <tipoCarroceria>NÃO APLICÁVEL</tipoCarroceria>

&#x20;       <potencia>000</potencia>

&#x20;       <docProprietario>XXXXXXXXXXXXXX</docProprietario>

&#x20;       <nomeProprietario>NOME\_PROPRIETÁRIO\_GENÉRICO</nomeProprietario>

&#x20;       <identFaturado>XXXXXXXXXXXXXX</identFaturado>

&#x20;       <Uf>XX</Uf>

&#x20;       <especie>ESPÉCIE\_GENÉRICA</especie>

&#x20;       <numeroEixoAuxiliar />

&#x20;       <numeroEixoTraseiro />

&#x20;       <numeroEixos>VALOR\_GENÉRICO</numeroEixos>

&#x20;       <procedencia>PROCEDÊNCIA\_GENÉRICA</procedencia>

&#x20;       <restricoes />

&#x20;       <restricao1>NADA CONSTA</restricao1>

&#x20;       <restricao2>NADA CONSTA</restricao2>

&#x20;       <restricao3>NADA CONSTA</restricao3>

&#x20;       <restricao4>NADA CONSTA</restricao4>

&#x20;       <restricaoRenajud>NÃO CONSTA RENAJUD</restricaoRenajud>

&#x20;       <restricaoRenainf>NADA CONSTA</restricaoRenainf>

&#x20;       <situacao>SITUAÇÃO\_GENÉRICA</situacao>

&#x20;       <ocorrencias>VEÍCULO NÃO POSSUI OCORRÊNCIA DE ROUBO E FURTO</ocorrencias>

&#x20;   </bin>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>0</alertaCodigo>

&#x20;       <alertaMensagem>VEÍCULO NÃO POSSUI HISTÓRICO DE ROUBO E FURTO</alertaMensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Resposta Requisição Sistema Indisponível De Roubo e Furto

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <bin>

&#x20;       <placa>XXX0000</placa>

&#x20;       <ultimaAtualizacao />

&#x20;       <tipoVeiculo>TIPO\_VEICULO\_GENÉRICO</tipoVeiculo>

&#x20;       <marca>MARCA\_GENÉRICA</marca>

&#x20;       <modelo>MODELO\_GENÉRICO</modelo>

&#x20;       <montagem />

&#x20;       <motor>MOTOR\_GENÉRICO</motor>

&#x20;       <lotacao />

&#x20;       <cor>COR\_GENÉRICA</cor>

&#x20;       <anoFabricacao>AAAA</anoFabricacao>

&#x20;       <anoModelo>AAAA</anoModelo>

&#x20;       <combustivel>COMBUSTÍVEL\_GENÉRICO</combustivel>

&#x20;       <municipio>MUNICÍPIO\_GENÉRICO</municipio>

&#x20;       <numCarroceria />

&#x20;       <caixaCambio />

&#x20;       <tipoChassi>TIPO\_CHASSI\_GENÉRICO</tipoChassi>

&#x20;       <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;       <renavam>XXXXXXXXXXX</renavam>

&#x20;       <capacidadeCarga>VALOR\_GENÉRICO</capacidadeCarga>

&#x20;       <cilindradas>0000</cilindradas>

&#x20;       <cmt>VALOR\_GENÉRICO</cmt>

&#x20;       <pbt>VALOR\_GENÉRICO</pbt>

&#x20;       <tipoCarroceria />

&#x20;       <potencia>000</potencia>

&#x20;       <docProprietario />

&#x20;       <nomeProprietario />

&#x20;       <identFaturado>XXXXXXXXXXXXXX</identFaturado>

&#x20;       <Uf>XX</Uf>

&#x20;       <especie>ESPÉCIE\_GENÉRICA</especie>

&#x20;       <numeroEixoAuxiliar />

&#x20;       <numeroEixoTraseiro />

&#x20;       <numeroEixos />

&#x20;       <procedencia>PROCEDÊNCIA\_GENÉRICA</procedencia>

&#x20;       <restricoes>RESTRIÇÃO\_GENÉRICA</restricoes>

&#x20;       <restricao1>NADA CONSTA</restricao1>

&#x20;       <restricao2>NADA CONSTA</restricao2>

&#x20;       <restricao3>NADA CONSTA</restricao3>

&#x20;       <restricao4>NADA CONSTA</restricao4>

&#x20;       <restricaoRenajud>NADA CONSTA</restricaoRenajud>

&#x20;       <restricaoRenainf />

&#x20;       <situacao>SITUAÇÃO\_GENÉRICA</situacao>

&#x20;       <ocorrencias>VEÍCULO NÃO POSSUI OCORRÊNCIA DE ROUBO E FURTO</ocorrencias>

&#x20;   </bin>

&#x20;   <historicoRouboFurto>

&#x20;       <codigo>4</codigo>

&#x20;       <alertaMensagem>Sistema Indisponível</alertaMensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <parametros>

&#x20;       <placa>AAA9999</placa>

&#x20;   </parametros>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}







\-------------------------



BASE estadual



Produtos

Conferi Base Estadual

Conferi Base Estadual

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-estadual?responseType=xml

\# Método da Requisição

A requisição para o endpoint do produto Conferi Base Estadual deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-estadual/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-estadual/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que pode conter um dos seguintes campos: placa ou chassi.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "AAA9999"

&#x20; }

}

\# Resposta Requisição

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <estadual>

&#x20;       <codigoConsulta>1234567</codigoConsulta>

&#x20;       <dado>VALOR\_GENERICO</dado>

&#x20;       <consultaPor>valor\_generico</consultaPor>

&#x20;       <placa>XXX0000</placa>

&#x20;       <tipoVeiculo>TIPO\_VEICULO\_GENÉRICO</tipoVeiculo>

&#x20;       <marca>MARCA\_GENÉRICA</marca>

&#x20;       <modelo>MODELO\_GENÉRICO</modelo>

&#x20;       <motor>MOTOR\_GENÉRICO</motor>

&#x20;       <cor>COR\_GENÉRICA</cor>

&#x20;       <anoFabricacao>AAAA</anoFabricacao>

&#x20;       <anoModelo>AAAA</anoModelo>

&#x20;       <categoria>CATEGORIA\_GENÉRICA</categoria>

&#x20;       <qtdPassageiros>5</qtdPassageiros>

&#x20;       <combustivel>COMBUSTÍVEL\_GENÉRICO</combustivel>

&#x20;       <municipio>MUNICÍPIO\_GENÉRICO</municipio>

&#x20;       <uf>XX</uf>

&#x20;       <numCarroceria />

&#x20;       <caixaCambio />

&#x20;       <tipoChassi>TIPO\_CHASSI\_GENÉRICO</tipoChassi>

&#x20;       <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;       <renavam>XXXXXXXXXXX</renavam>

&#x20;       <capacidadeCarga>0</capacidadeCarga>

&#x20;       <cilindradas>0000</cilindradas>

&#x20;       <cmt>000</cmt>

&#x20;       <pbt>000</pbt>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA\_GENÉRICO</tipoCarroceria>

&#x20;       <potencia>000</potencia>

&#x20;       <tipoDocProprietario>TIPO\_DOC\_GENÉRICO</tipoDocProprietario>

&#x20;       <docProprietario>XXXXXXXXXXX</docProprietario>

&#x20;       <proprietario>PROPRIETÁRIO\_GENÉRICO</proprietario>

&#x20;       <propriAnterior />

&#x20;       <uf\_faturado>XX</uf\_faturado>

&#x20;       <comunicacaoVendaAtiva>COMUNICAÇÃO\_GENÉRICA</comunicacaoVendaAtiva>

&#x20;       <dataTransferencia />

&#x20;       <comunicInclusao />

&#x20;       <tipoComprador />

&#x20;       <docComprador />

&#x20;       <notaFiscal />

&#x20;       <protocoloDetran />

&#x20;       <inspecaoAno />

&#x20;       <inspecaoCentro />

&#x20;       <inspecaoData />

&#x20;       <inspecaoSelo />

&#x20;       <inspecaoStatus />

&#x20;       <codigoFinanceira />

&#x20;       <dataInclusaoIntencaoTrocaFinanceira />

&#x20;       <numeroContratoFinanceira />

&#x20;       <CodigoAgenteFinanceiro />

&#x20;       <dataVigenciaContratoFinanceira />

&#x20;       <especie>ESPÉCIE\_GENÉRICA</especie>

&#x20;       <tipo\_identFaturado>TIPO\_IDENT\_GENÉRICO</tipo\_identFaturado>

&#x20;       <identFaturado>XXXXXXXXXXXXXX</identFaturado>

&#x20;       <identImportador />

&#x20;       <eixoAuxiliar />

&#x20;       <eixoTraseiro />

&#x20;       <numeroEixos>0</numeroEixos>

&#x20;       <restrTributaria>NADA CONSTA</restrTributaria>

&#x20;       <existeDebitoMulta>NADA CONSTA</existeDebitoMulta>

&#x20;       <existeDebitoIPVA>NADA CONSTA</existeDebitoIPVA>

&#x20;       <existeDebitoLicenciamento>NADA CONSTA</existeDebitoLicenciamento>

&#x20;       <existeDebitoDpvat>NADA CONSTA</existeDebitoDpvat>

&#x20;       <licenciamento />

&#x20;       <dataLicenciamento>DD/MM/AAAA</dataLicenciamento>

&#x20;       <debitoIpva>0,00</debitoIpva>

&#x20;       <debitoDpvat>0,00</debitoDpvat>

&#x20;       <debitoLicenciamento>0,00</debitoLicenciamento>

&#x20;       <debitoMulta>0,00</debitoMulta>

&#x20;       <debitoMunicipais>0,00</debitoMunicipais>

&#x20;       <infracaoRenainf />

&#x20;       <procedencia>PROCEDÊNCIA\_GENÉRICA</procedencia>

&#x20;       <situacao>CIRCULAÇÃO</situacao>

&#x20;       <dataEmissaoCRV>DD/MM/AAAA</dataEmissaoCRV>

&#x20;       <debitoDersa />

&#x20;       <debitoDer />

&#x20;       <debitoDetran />

&#x20;       <debitoPoliciaRodoviaria />

&#x20;       <restricoes />

&#x20;       <restricoes\_01>RESTRIÇÃO\_GENÉRICA</restricoes\_01>

&#x20;       <restricoes\_02 />

&#x20;       <restricoes\_03 />

&#x20;       <restricoes\_04 />

&#x20;       <restricoes\_05 />

&#x20;       <observacoes />

&#x20;       <restricoesRenajud>NADA CONSTA</restricoesRenajud>

&#x20;       <restricaoFinanceira>RESTRIÇÃO\_GENÉRICA</restricaoFinanceira>

&#x20;       <restricaoAdm>NADA CONSTA</restricaoAdm>

&#x20;       <restricaoFurto>NADA CONSTA</restricaoFurto>

&#x20;       <restricaoGuincho>NADA CONSTA</restricaoGuincho>

&#x20;       <restricaoJudicial>NADA CONSTA</restricaoJudicial>

&#x20;       <restricaoAmbiental />

&#x20;       <restricaoNomeAgente />

&#x20;       <restricaoArrendatario />

&#x20;       <restricaoDataInclusao />

&#x20;       <restricaoCPFCNPJARRENDATAR />

&#x20;       <intencaoRestricaoFinanceira />

&#x20;       <outrasRestricoes />

&#x20;       <estadual\_gravame\_codigoAgente />

&#x20;       <estadual\_gravame\_data />

&#x20;       <estadual\_gravame\_vigencia\_contrato />

&#x20;       <estadual\_gravame\_documento\_financiado />

&#x20;       <estadual\_gravame\_nome\_agente />

&#x20;       <estadual\_gravame\_numero\_contrato />

&#x20;       <estadual\_gravame\_restricao\_financeira>RESTRIÇÃO\_GENÉRICA</estadual\_gravame\_restricao\_financeira>

&#x20;       <estadual\_intencao\_gravame\_agente />

&#x20;       <estadual\_intencao\_gravame\_data\_inclusao />

&#x20;       <estadual\_intencao\_gravame\_documento\_financiado />

&#x20;       <estadual\_intencao\_gravame\_nome\_financiado />

&#x20;       <estadual\_intencao\_gravame\_restricao\_financeira />

&#x20;       <intencaoNomeAgente />

&#x20;       <intencaoNomeFinanceira />

&#x20;       <intencaoCPFCNPJFinanceira />

&#x20;       <intencaoDataInclusao />

&#x20;       <debcetesb />

&#x20;       <licexelic />

&#x20;       <dataLimiteRestricaoTributaria />

&#x20;       <ultimaAtualizacao />

&#x20;   </estadual>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <parametros>

&#x20;       <placa>AAA9999</placa>

&#x20;   </parametros>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}





\-------------------------------





COMPANY CRLV 

Conferi CRLV

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-crlv?responseType=xml

\# Método da Requisição

A requisição para o endpoint do produto Conferi CRLV deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-crlv/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-crlv/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que pode conter um dos seguintes campos: placa ou chassi, UF, documento e renavam.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

uf	Unidade Federativa (UF) onde o veículo está registrado. Deve consistir em uma sigla de dois caracteres representando um dos estados brasileiros ou o Distrito Federal (exemplo: SP, RJ, DF). Atualmente, somente são suportadas as unidades São Paulo (SP), Maranhão (MA), Mato Grosso (MT), Minas Gerais (MG), Pará (PA), Paraná (PR) e Tocantins (TO). String

documento	Número do documento do proprietário do veículo. Deve ser um CPF válido (11 dígitos) ou um CNPJ válido (14 dígitos), sem pontos, traços ou barras. String

renavam	Número de Registro Nacional de Veículos Automotores (Renavam). Deve conter entre 9 e 11 dígitos numéricos. Number

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "AAA9999",

&#x20;   "uf": "SP",

&#x20;   "documento": "12345678900",

&#x20;   "renavam": "99900099900"

&#x20; }

}

\# Resposta Requisição

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <crlv>

&#x20;       <Retorno>

&#x20;           <placa>XXX0000</placa>

&#x20;           <chassi>CHASSI\_GENÉRICO</chassi>

&#x20;           <renavam>XXXXXXXXXXX</renavam>

&#x20;           <marca>MARCA\_GENÉRICA</marca>

&#x20;           <municipio>MUNICÍPIO\_GENÉRICO</municipio>

&#x20;           <uf>XX</uf>

&#x20;           <anoFabricacao>AAAA</anoFabricacao>

&#x20;           <anoModelo>AAAA</anoModelo>

&#x20;           <linkCRLV>https://link-crlv-genérico.com/pdf-crlv</linkCRLV>

&#x20;       </Retorno>

&#x20;   </crlv>

&#x20;   <hashPesquisa>

&#x20;       HASH\_GENERICO

&#x20;   </hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <parametros>

&#x20;       <placa>AAA9999</placa>

&#x20;       <uf>UF</uf>

&#x20;       <documento>12345678900</documento>

&#x20;       <renavam>99900099900</renavam>

&#x20;   </parametros>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}



\------



GRAVAME

Conferi Gravame

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-gravame?responseType=xml

\# Método da Requisição

A requisição para o endpoint do produto Conferi Gravame deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-gravame/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-gravame/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que pode conter um dos seguintes campos: chassi.



Parâmetros	Descrição

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "chassi": "xxxxxxxxxxxxxxx"

&#x20; }

}

\# Resposta Requisição

Aviso

Os campos do bloco gravame podem ou não aparecer na resposta, dependendo dos dados retornados pelas bases consultadas. Quando uma informação não estiver disponível, o campo correspondente poderá vir vazio ou ser omitido do retorno.

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <gravame>

&#x20;       <resposta>Veículo constou/consta na base de gravames</resposta>

&#x20;       <gravame>

&#x20;           <placa>XXX0000</placa>

&#x20;           <chassi>XXXXXXXXXXXXXXXXX</chassi>

&#x20;           <uf>XX</uf>

&#x20;           <anoFabricacao />

&#x20;           <anoModelo />

&#x20;           <renavam>XXXXXXXXXXX</renavam>

&#x20;           <documento>XXXXXXXXXXX</documento>

&#x20;           <nomeFinanciado>NOME\_FINANCIADO\_GENÉRICO</nomeFinanciado>

&#x20;           <contrato>CONTRATO\_GENÉRICO</contrato>

&#x20;           <documentoFinanceira />

&#x20;           <nomeFinanceira>FINANCEIRA\_GENÉRICA</nomeFinanceira>

&#x20;           <codigoFinanceira>XXXX</codigoFinanceira>

&#x20;           <ufGravame />

&#x20;           <dataGravame>AAAA-MM-DD</dataGravame>

&#x20;           <situacao>Atual</situacao>

&#x20;           <statusVeiculo>STATUS\_VEÍCULO\_GENÉRICO</statusVeiculo>

&#x20;           <descricao>DESCRICAO\_GENÉRICA</descricao>

&#x20;       </gravame>

&#x20;   </gravame>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Nenhum Registro Encontrado

O retorno de nenhum registro encontrado descreve que o veículo não foi encontrado nas bases consultadas.



Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="0" mensagem="Nenhum Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <gravame>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </gravame>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <parametros>

&#x20;       <placa>AAA9999</placa>

&#x20;   </parametros>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}









\-



\----------

agregados. 





Conferi Agregados

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-agregados?responseType=xml

\# Método da Requisição

A requisição para o endpoint do produto Conferi Agregados deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-agregados/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-agregados/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que pode conter um dos seguintes campos: placa, chassi, motor ou cambio.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

motor	Motor do veículo. Deve conter um motor valido. String

cambio	Câmbio do veículo. Deve conter um câmbio valido. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "AAA9999"

&#x20; }

}

\# Resposta Requisição

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <consultaPor>valor\_generico</consultaPor>

&#x20;       <placa>XXX0000</placa>

&#x20;       <chassi>XXXXXXXXXXXXXXX</chassi>

&#x20;       <Uf>XX</Uf>

&#x20;       <UfDeOrigem>XX</UfDeOrigem>

&#x20;       <uf\_faturado>XX</uf\_faturado>

&#x20;       <municipio>Município Genérico</municipio>

&#x20;       <tipoDocProprietario />

&#x20;       <docProprietario />

&#x20;       <situacao>EM\_CIRCULACAO</situacao>

&#x20;       <renavam />

&#x20;       <marca>Marca Genérica</marca>

&#x20;       <modelo>Modelo Genérico</modelo>

&#x20;       <cor>Cor Genérica</cor>

&#x20;       <tipoVeiculo>Veículo Genérico</tipoVeiculo>

&#x20;       <especie>Especie Genérica</especie>

&#x20;       <combustivel>Combustível Genérico</combustivel>

&#x20;       <lotacao>5</lotacao>

&#x20;       <motor>Motor Genérico</motor>

&#x20;       <anoModelo>AAAA</anoModelo>

&#x20;       <caixaCambio />

&#x20;       <anoFabricacao>AAAA</anoFabricacao>

&#x20;       <montagem />

&#x20;       <potencia>000</potencia>

&#x20;       <tipoCarroceria />

&#x20;       <cilindradas>0000</cilindradas>

&#x20;       <numCarroceria />

&#x20;       <procedencia>Procedência Genérica</procedencia>

&#x20;       <tipoChassi>N</tipoChassi>

&#x20;       <ultimaAtualizacao>AAAA-MM-DD HH:MM:SS</ultimaAtualizacao>

&#x20;       <tipoDocFaturado />

&#x20;       <docFaturado>Não informado</docFaturado>

&#x20;       <binMotor />

&#x20;       <motorBusca />

&#x20;       <capacidadeCarga>000</capacidadeCarga>

&#x20;       <eixoTraseiro>0</eixoTraseiro>

&#x20;       <terceiroEixo>0</terceiroEixo>

&#x20;       <eixos>2</eixos>

&#x20;       <tipoDocImportadora />

&#x20;       <identImportadora>0</identImportadora>

&#x20;       <numeroDI>0</numeroDI>

&#x20;       <dataRegistriDI>0</dataRegistriDI>

&#x20;       <fabricante />

&#x20;       <segmento>Segmento Genérico</segmento>

&#x20;       <subSegmento />

&#x20;       <grupoModeloVeiculo>Grupo Modelo Genérico</grupoModeloVeiculo>

&#x20;       <DT\_LimiteRestricaoTrib />

&#x20;       <capMaximaTracao />

&#x20;       <pesoBrutoTotal>000</pesoBrutoTotal>

&#x20;       <restricao1>Restrição Genérica 1</restricao1>

&#x20;       <restricao2>Restrição Genérica 2</restricao2>

&#x20;       <restricao3>Restrição Genérica 3</restricao3>

&#x20;       <restricao4>Restrição Genérica 4</restricao4>

&#x20;   </agregados>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Nenhum Registro Encontrado

O retorno de nenhum registro encontrado descreve que o veículo não foi encontrado nas bases consultadas.



Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="0" mensagem="Nenhum Registro Encontrado" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </agregados>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <parametros>

&#x20;       <placa>AAA9999</placa>

&#x20;   </parametros>

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}


-----



AUTO PERICIA GOLD

Conferi Auto Pericia Gold

Homologação

Saiba mais

O ambiente de homologação desse serviço está disponível na seguinte rota:



XML

JSON

https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-veiculo?responseType=xml

Importante

Os insumos associados a este produto podem estar ou não omitidos para uso, variando se estão ou não ativos na consulta propriamente. Para compreender melhor se um serviço está ou não disponibilizado, procure o atendimento da Company Conferi ou entre em contato.

\# Método da Requisição

A requisição para o endpoint do produto Conferi Auto Pericia Gold deve ser feita utilizando o método POST.



\# Requisição

A URL está preparada para fornecer respostas em XML ou JSON. Para receber o formato desejado, insira /xml ou /json no final da URL.



URL XML



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-veiculo/xml

URL JSON



POST

https://webservice.companyconferi.com.br/api-clientes/conferi-veiculo/json

\# Corpo Requisição

O corpo da requisição deve incluir os atributos usuário e senha, além de um objeto chamado parametros, que deve conter os seguintes campos: placa ou chassi e produto.



Parâmetros	Descrição

placa	Placa do veículo. Deve seguir um dos padrões (AAA9999) ou (AAA9A99). String

chassi	Chassi do veículo. Deve conter entre 7 e 18 caracteres. String

produto	Produtos. O nome do produto solicitado deve ser informado exatamente como: 'conferi-auto-pericia-gold'. String

Corpo



{

&#x20; "usuario": 0000,

&#x20; "senha": "senha",

&#x20; "parametros": {

&#x20;   "placa": "ABC9999",

&#x20;   "produto": "conferi-auto-pericia-gold"

&#x20; }

}

Aviso

Nos exemplos a seguir, os insumos estão organizados conforme os tipos de resposta: Com registro, Nenhum Registro Encontrado e Sistema indisponível. No entanto, no retorno real, os insumos apresentarão um desses três tipos de resposta, conforme o resultado das bases consultadas, sem seguir necessariamente o mesmo agrupamento dos exemplos.

\# Historico Roubo e Furto

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Valores	Descrição

0	Indisponível. Number

1	Consta histórico de roubo e furto. Number

2	Não consta histórico de roubo e furto. Number

\# Comercialização

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Valores	Descrição

0	Não Consta. Number

1	CONSTA COMERCIALIZAÇÃO. Number

2	Indisponível. Number

3	SUJEITO A OFERTA EM LEILÃO / NÃO CONSTA COMERCIALIZAÇÃO / Passagem por Pátio. Number

4	CONSTA COMERCIALIZAÇÃO E SUJEITO A OFERTA EM LEILÃO / Passagem por Pátio. Number

5	SUJEITO A OFERTA EM LEILÃO / Passagem por Pátio. Number

6	NÃO CONSTA COMERCIALIZAÇÃO / CONSTA DESMOBILIZAÇÃO DE FROTA. Number

7	CONSTA COMERCIALIZAÇÃO / CONSTA DESMOBILIZAÇÃO DE FROTA. Number

8	CONSTA COMERCIALIZAÇÃO POR BANCO Number

9	CONSTA COMERCIALIZAÇÃO POR SEGURADORA Number

10	CONSTA COMERCIALIZAÇÃO POR FROTA Number

11	CONSTA COMERCIALIZAÇÃO POR SEGURADORA E BANCO Number

\# Indicio de Sinistro

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Valores	Descrição

nulo	Vazio. Null

0	Não existe indício de sinistro. Number

1	Encontrado indício de sinistro. Number

3	Indisponível. Number

4	Encontrado indício de dano. Number

\# Indicio de Sinistro 2

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado.



Valores	Descrição

nulo	VAZIO Null

0	NÃO CONSTA. Number

1	VEÍCULO COM ACIONAMENTO DE SEGURO SEM INDENIZAÇÃO INTEGRAL. Number

\# Sinistro

Os dados a seguir correspondem às informações retornadas em cada resposta, conforme o insumo especificado anteriormente.



Resposta	Mensagem

NAO	NAO EXISTE SINISTRO DE INDENIZAÇÃO INTEGRAL String

SIM	ENCONTRADO SINISTRO DE INDENIZAÇÃO INTEGRAL String

VAZIO	"" String

SIM	ENCONTRADO SINISTRO DE INDENIZAÇÃO INTEGRAL / AVARIAS String

Aviso

A resposta de valor “vazio“ significa que há a ausência de informação presente no campo, devida indisponibilidade do serviço associado.

\# Parecer Técnico

O Parecer Técnico indica a aceitação do veículo no mercado securitário da seguinte maneira.



Valores	Descrição

verde	A cor verde indica que o veículo possui uma boa aceitação no mercado securitário. String

amarelo	A cor amarela indica que o veículo possui uma aceitação média no mercado securitário. String

vermelho	A cor vermelha indica que o veículo possui uma difícil aceitação no mercado securitário. String

Aviso

É importante ressaltar que essas classificações podem variar conforme os critérios internos de cada seguradora. Além das cores, os níveis de aceitação podem ser variáveis, como 100%, 90%, 80%, dependendo da avaliação específica de cada seguradora.

\# Resposta Requisição

Aviso

No bloco gravame, esta consulta retorna apenas uma mensagem de referência. Os dados detalhados de gravame são obtidos pelo produto Conferi Gravame, e seus campos podem ou não aparecer na resposta, dependendo dos dados retornados pelas bases consultadas.

Aviso

No exemplo de retorno abaixo, os blocos vendaDireta e eventoCorporativo aparecem juntos apenas para fins ilustrativos. Em uma resposta real, apenas um dos dois será retornado por consulta, conforme o tipo de evento encontrado para o veículo — são mutuamente exclusivos.

Aviso

O bloco alertaDeAcidente só é retornado na resposta quando há informação de acidente ou avarias para o veículo consultado. Caso não exista esse registro nas bases consultadas, o campo não aparecerá no retorno.

Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <consultaPor>TIPO\_CONSULTA</consultaPor>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <Uf>UF\_VEICULO</Uf>

&#x20;       <UfDeOrigem>UF\_ORIGEM\_VEICULO</UfDeOrigem>

&#x20;       <uf\_faturado>UF\_FATURAMENTO\_VEICULO</uf\_faturado>

&#x20;       <municipio>MUNICIPIO\_VEICULO</municipio>

&#x20;       <tipoDocProprietario>TIPO\_DOC\_PROPRIETARIO</tipoDocProprietario>

&#x20;       <docProprietario>DOCUMENTO\_PROPRIETARIO</docProprietario>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <especie>ESPECIE\_VEICULO</especie>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <lotacao>LOTACAO\_VEICULO</lotacao>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;       <caixaCambio>CAIXA\_CAMBIO\_VEICULO</caixaCambio>

&#x20;       <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;       <montagem>MONTAGEM\_VEICULO</montagem>

&#x20;       <potencia>POTENCIA\_VEICULO</potencia>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA\_VEICULO</tipoCarroceria>

&#x20;       <cilindradas>CILINDRADAS\_VEICULO</cilindradas>

&#x20;       <numCarroceria>NUMERO\_CARROCERIA\_VEICULO</numCarroceria>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <tipoChassi>TIPO\_CHASSI\_VEICULO</tipoChassi>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO\_VEICULO</ultimaAtualizacao>

&#x20;       <tipoDocFaturado>TIPO\_DOC\_FATURADO\_VEICULO</tipoDocFaturado>

&#x20;       <docFaturado>DOCUMENTO\_FATURADO\_VEICULO</docFaturado>

&#x20;       <binMotor>BIN\_MOTOR\_VEICULO</binMotor>

&#x20;       <motorBusca>MOTOR\_BUSCA\_VEICULO</motorBusca>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA\_VEICULO</capacidadeCarga>

&#x20;       <eixoTraseiro>EIXO\_TRASEIRO\_VEICULO</eixoTraseiro>

&#x20;       <terceiroEixo>TERCEIRO\_EIXO\_VEICULO</terceiroEixo>

&#x20;       <eixos>NUMERO\_EIXOS\_VEICULO</eixos>

&#x20;       <tipoDocImportadora>TIPO\_DOC\_IMPORTADORA</tipoDocImportadora>

&#x20;       <identImportadora>IDENTIFICACAO\_IMPORTADORA</identImportadora>

&#x20;       <numeroDI>NUMERO\_DI\_VEICULO</numeroDI>

&#x20;       <dataRegistriDI>DATA\_REGISTRO\_DI\_VEICULO</dataRegistriDI>

&#x20;       <fabricante>FABRICANTE\_VEICULO</fabricante>

&#x20;       <segmento>SEGMENTO\_VEICULO</segmento>

&#x20;       <subSegmento>SUBSEGMENTO\_VEICULO</subSegmento>

&#x20;       <grupoModeloVeiculo>GRUPO\_MODELO\_VEICULO</grupoModeloVeiculo>

&#x20;       <DT\_LimiteRestricaoTrib>DATA\_LIMITE\_RESTRICAO\_TRIBUTARIA</DT\_LimiteRestricaoTrib>

&#x20;       <capMaximaTracao>CAPACIDADE\_MAXIMA\_TRACAO\_VEICULO</capMaximaTracao>

&#x20;       <pesoBrutoTotal>PESO\_BRUTO\_TOTAL\_VEICULO</pesoBrutoTotal>

&#x20;       <restricao1>RESTRICAO1\_VEICULO</restricao1>

&#x20;       <restricao2>RESTRICAO2\_VEICULO</restricao2>

&#x20;       <restricao3>RESTRICAO3\_VEICULO</restricao3>

&#x20;       <restricao4>RESTRICAO4\_VEICULO</restricao4>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO</ultimaAtualizacao>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <montagem>MONTAGEM\_VEICULO</montagem>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <lotacao>LOTACAO\_VEICULO</lotacao>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;       <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <municipio>MUNICIPIO\_VEICULO</municipio>

&#x20;       <numCarroceria>NUM\_CARROCERIA\_VEICULO</numCarroceria>

&#x20;       <caixaCambio>CAIXA\_CAMBIO\_VEICULO</caixaCambio>

&#x20;       <tipoChassi>TIPO\_CHASSI\_VEICULO</tipoChassi>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA\_VEICULO</capacidadeCarga>

&#x20;       <cilindradas>CILINDRADAS\_VEICULO</cilindradas>

&#x20;       <cmt>CMT\_VEICULO</cmt>

&#x20;       <pbt>PBT\_VEICULO</pbt>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA\_VEICULO</tipoCarroceria>

&#x20;       <potencia>POTENCIA\_VEICULO</potencia>

&#x20;       <docProprietario>DOC\_PROPRIETARIO</docProprietario>

&#x20;       <nomeProprietario>NOME\_PROPRIETARIO</nomeProprietario>

&#x20;       <identFaturado>IDENT\_FATURADO</identFaturado>

&#x20;       <Uf>UF\_VEICULO</Uf>

&#x20;       <especie>ESPECIE\_VEICULO</especie>

&#x20;       <numeroEixoAuxiliar>NUM\_EIXO\_AUXILIAR</numeroEixoAuxiliar>

&#x20;       <numeroEixoTraseiro>NUM\_EIXO\_TRASEIRO</numeroEixoTraseiro>

&#x20;       <numeroEixos>NUM\_EIXOS</numeroEixos>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <restricoes>RESTRICOES\_VEICULO</restricoes>

&#x20;       <restricao1>RESTRICAO1\_VEICULO</restricao1>

&#x20;       <restricao2>RESTRICAO2\_VEICULO</restricao2>

&#x20;       <restricao3>RESTRICAO3\_VEICULO</restricao3>

&#x20;       <restricao4>RESTRICAO4\_VEICULO</restricao4>

&#x20;       <restricaoRenajud>RENAJUD\_VEICULO</restricaoRenajud>

&#x20;       <restricaoRenainf>RENAINF\_VEICULO</restricaoRenainf>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <ocorrencias>OCORRENCIAS\_VEICULO</ocorrencias>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <retorno>

&#x20;           <Chassi>CHASSI\_VEICULO</Chassi>

&#x20;           <IdentificacaoCsv>ID\_CSV</IdentificacaoCsv>

&#x20;           <TipoCsv>TIPO\_CSV</TipoCsv>

&#x20;           <DataInspecao>DATA\_INSPECAO</DataInspecao>

&#x20;           <Proprietario>NOME\_PROPRIETARIO</Proprietario>

&#x20;           <Municipio>MUNICIPIO\_PROPRIETARIO</Municipio>

&#x20;           <ITL>ITL\_ORGANIZACAO</ITL>

&#x20;           <ITL\_CNPJ>CNPJ\_ITL</ITL\_CNPJ>

&#x20;           <Escopo>ESCOPO\_INSPECAO</Escopo>

&#x20;           <pdf\_path>LINK\_PDF\_CSV</pdf\_path>

&#x20;       </retorno>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>ALERTA\_CODIGO</alertaCodigo>

&#x20;       <alertaMensagem>ALERTA\_MENSAGEM</alertaMensagem>

&#x20;       <historico>

&#x20;           <rouboFurto>

&#x20;               <ocorrencia>OCORRENCIA\_STATUS</ocorrencia>

&#x20;               <orgaoSeguranca>ORGAO\_SEGURANCA</orgaoSeguranca>

&#x20;               <municipioEmplacamento>MUNICIPIO\_EMPLACAMENTO</municipioEmplacamento>

&#x20;               <municipioOcorrencia>MUNICIPIO\_OCORRENCIA</municipioOcorrencia>

&#x20;               <Ufocorrencia>UF\_OCORRENCIA</Ufocorrencia>

&#x20;               <anoBo>ANO\_BO</anoBo>

&#x20;               <dataOcorrencia>DATA\_OCORRENCIA</dataOcorrencia>

&#x20;               <numeroBo>NUMERO\_BO</numeroBo>

&#x20;               <placa>PLACA\_VEICULO</placa>

&#x20;               <chassi>CHASSI\_VEICULO</chassi>

&#x20;               <marca>MARCA\_VEICULO</marca>

&#x20;               <modelo>MODELO\_VEICULO</modelo>

&#x20;               <anoFabricacao>ANO\_FABRICACAO\_VEICULO</anoFabricacao>

&#x20;               <anoModelo>ANO\_MODELO\_VEICULO</anoModelo>

&#x20;               <cor>COR\_VEICULO</cor>

&#x20;               <renavam>RENAVAM\_VEICULO</renavam>

&#x20;               <Uf>UF\_VEICULO</Uf>

&#x20;               <observacoes>OBSERVACOES</observacoes>

&#x20;               <informante>INFORMANTE</informante>

&#x20;               <documento>DOCUMENTO</documento>

&#x20;               <numeroDocumento>NUMERO\_DOCUMENTO</numeroDocumento>

&#x20;               <ramal>RAMAL</ramal>

&#x20;               <telefone>TELEFONE</telefone>

&#x20;           </rouboFurto>

&#x20;       </historico>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <codigoConsulta>CODIGO\_CONSULTA</codigoConsulta>

&#x20;       <dado>DADO\_VEICULO</dado>

&#x20;       <consultaPor>CONSULTA\_POR</consultaPor>

&#x20;       <placa>PLACA\_VEICULO</placa>

&#x20;       <tipoVeiculo>TIPO\_VEICULO</tipoVeiculo>

&#x20;       <marca>MARCA\_VEICULO</marca>

&#x20;       <modelo>MODELO\_VEICULO</modelo>

&#x20;       <motor>MOTOR\_VEICULO</motor>

&#x20;       <cor>COR\_VEICULO</cor>

&#x20;       <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;       <anoModelo>ANO\_MODELO</anoModelo>

&#x20;       <categoria>CATEGORIA\_VEICULO</categoria>

&#x20;       <qtdPassageiros>QTD\_PASSAGEIROS</qtdPassageiros>

&#x20;       <combustivel>COMBUSTIVEL\_VEICULO</combustivel>

&#x20;       <municipio>MUNICIPIO</municipio>

&#x20;       <uf>UF\_VEICULO</uf>

&#x20;       <numCarroceria>NUM\_CARROCERIA</numCarroceria>

&#x20;       <caixaCambio>CAIXA\_CAMBIO</caixaCambio>

&#x20;       <tipoChassi>TIPO\_CHASSI</tipoChassi>

&#x20;       <chassi>CHASSI\_VEICULO</chassi>

&#x20;       <renavam>RENAVAM\_VEICULO</renavam>

&#x20;       <capacidadeCarga>CAPACIDADE\_CARGA</capacidadeCarga>

&#x20;       <cilindradas>CILINDRADAS</cilindradas>

&#x20;       <cmt>CMT</cmt>

&#x20;       <pbt>PBT</pbt>

&#x20;       <tipoCarroceria>TIPO\_CARROCERIA</tipoCarroceria>

&#x20;       <potencia>POTENCIA</potencia>

&#x20;       <tipoDocProprietario>TIPO\_DOC\_PROPRIETARIO</tipoDocProprietario>

&#x20;       <docProprietario>DOC\_PROPRIETARIO</docProprietario>

&#x20;       <proprietario>PROPRIETARIO\_VEICULO</proprietario>

&#x20;       <propriAnterior>PROPRIETARIO\_ANTERIOR</propriAnterior>

&#x20;       <uf\_faturado>UF\_FATURADO</uf\_faturado>

&#x20;       <comunicacaoVendaAtiva>COMUNICACAO\_VENDA\_ATIVA</comunicacaoVendaAtiva>

&#x20;       <dataTransferencia>DATA\_TRANSFERENCIA</dataTransferencia>

&#x20;       <comunicInclusao>COMUNIC\_INCLUSAO</comunicInclusao>

&#x20;       <tipoComprador>TIPO\_COMPRADOR</tipoComprador>

&#x20;       <docComprador>DOC\_COMPRADOR</docComprador>

&#x20;       <notaFiscal>NOTA\_FISCAL</notaFiscal>

&#x20;       <protocoloDetran>PROTOCOLO\_DETRAN</protocoloDetran>

&#x20;       <inspecaoAno>INSPECAO\_ANO</inspecaoAno>

&#x20;       <inspecaoCentro>INSPECAO\_CENTRO</inspecaoCentro>

&#x20;       <inspecaoData>INSPECAO\_DATA</inspecaoData>

&#x20;       <inspecaoSelo>INSPECAO\_SELO</inspecaoSelo>

&#x20;       <inspecaoStatus>INSPECAO\_STATUS</inspecaoStatus>

&#x20;       <codigoFinanceira>CODIGO\_FINANCEIRA</codigoFinanceira>

&#x20;       <dataInclusaoIntencaoTrocaFinanceira>DATA\_INCLUSAO\_INTENCAO</dataInclusaoIntencaoTrocaFinanceira>

&#x20;       <numeroContratoFinanceira>NUMERO\_CONTRATO\_FINANCEIRA</numeroContratoFinanceira>

&#x20;       <CodigoAgenteFinanceiro>CODIGO\_AGENTE\_FINANCEIRO</CodigoAgenteFinanceiro>

&#x20;       <dataVigenciaContratoFinanceira>DATA\_VIGENCIA\_FINANCEIRA</dataVigenciaContratoFinanceira>

&#x20;       <especie>ESPECIE</especie>

&#x20;       <tipo\_identFaturado>TIPO\_IDENT\_FATURADO</tipo\_identFaturado>

&#x20;       <identFaturado>IDENT\_FATURADO</identFaturado>

&#x20;       <identImportador>IDENT\_IMPORTADOR</identImportador>

&#x20;       <eixoAuxiliar>EIXO\_AUXILIAR</eixoAuxiliar>

&#x20;       <eixoTraseiro>EIXO\_TRASEIRO</eixoTraseiro>

&#x20;       <numeroEixos>NUMERO\_EIXOS</numeroEixos>

&#x20;       <restrTributaria>RESTRICAO\_TRIBUTARIA</restrTributaria>

&#x20;       <existeDebitoMulta>DEBITO\_MULTA</existeDebitoMulta>

&#x20;       <existeDebitoIPVA>DEBITO\_IPVA</existeDebitoIPVA>

&#x20;       <existeDebitoLicenciamento>DEBITO\_LICENCIAMENTO</existeDebitoLicenciamento>

&#x20;       <existeDebitoDpvat>DEBITO\_DPVAT</existeDebitoDpvat>

&#x20;       <licenciamento>ANO\_LICENCIAMENTO</licenciamento>

&#x20;       <dataLicenciamento>DATA\_LICENCIAMENTO</dataLicenciamento>

&#x20;       <debitoIpva>DEBITO\_IPVA\_VALOR</debitoIpva>

&#x20;       <debitoDpvat>DEBITO\_DPVAT\_VALOR</debitoDpvat>

&#x20;       <debitoLicenciamento>DEBITO\_LICENCIAMENTO\_VALOR</debitoLicenciamento>

&#x20;       <debitoMulta>DEBITO\_MULTA\_VALOR</debitoMulta>

&#x20;       <debitoMunicipais>DEBITO\_MUNICIPAIS\_VALOR</debitoMunicipais>

&#x20;       <infracaoRenainf>INFRACAO\_RENAINF\_VALOR</infracaoRenainf>

&#x20;       <procedencia>PROCEDENCIA\_VEICULO</procedencia>

&#x20;       <situacao>SITUACAO\_VEICULO</situacao>

&#x20;       <dataEmissaoCRV>DATA\_EMISSAO\_CRV</dataEmissaoCRV>

&#x20;       <debitoDersa>DEBITO\_DERSA\_VALOR</debitoDersa>

&#x20;       <debitoDer>DEBITO\_DER\_VALOR</debitoDer>

&#x20;       <debitoDetran>DEBITO\_DETRAN\_VALOR</debitoDetran>

&#x20;       <debitoPoliciaRodoviaria>DEBITO\_POLICIA\_RODOVIARIA\_VALOR</debitoPoliciaRodoviaria>

&#x20;       <restricoes>RESTRICOES\_VEICULO</restricoes>

&#x20;       <restricoes\_01>RESTRICOES\_01</restricoes\_01>

&#x20;       <restricoes\_02>RESTRICOES\_02</restricoes\_02>

&#x20;       <restricoes\_03>RESTRICOES\_03</restricoes\_03>

&#x20;       <restricoes\_04>RESTRICOES\_04</restricoes\_04>

&#x20;       <restricoes\_05>RESTRICOES\_05</restricoes\_05>

&#x20;       <observacoes>OBSERVACOES</observacoes>

&#x20;       <restricoesRenajud>RESTRICOES\_RENAJUD</restricoesRenajud>

&#x20;       <restricaoFinanceira>RESTRICAO\_FINANCEIRA</restricaoFinanceira>

&#x20;       <restricaoAdm>RESTRICAO\_ADM</restricaoAdm>

&#x20;       <restricaoFurto>RESTRICAO\_FURTO</restricaoFurto>

&#x20;       <restricaoGuincho>RESTRICAO\_GUINCHO</restricaoGuincho>

&#x20;       <restricaoJudicial>RESTRICAO\_JUDICIAL</restricaoJudicial>

&#x20;       <restricaoAmbiental>RESTRICAO\_AMBIENTAL</restricaoAmbiental>

&#x20;       <restricaoNomeAgente>RESTRICAO\_NOME\_AGENTE</restricaoNomeAgente>

&#x20;       <restricaoArrendatario>RESTRICAO\_ARRENDATARIO</restricaoArrendatario>

&#x20;       <restricaoDataInclusao>RESTRICAO\_DATA\_INCLUSAO</restricaoDataInclusao>

&#x20;       <restricaoCPFCNPJARRENDATAR>RESTRICAO\_CPFCNPJ\_ARRENDATARIO</restricaoCPFCNPJARRENDATAR>

&#x20;       <intencaoRestricaoFinanceira>INTENCAO\_RESTRICAO\_FINANCEIRA</intencaoRestricaoFinanceira>

&#x20;       <outrasRestricoes>OUTRAS\_RESTRICOES</outrasRestricoes>

&#x20;       <estadual\_gravame\_codigoAgente>ESTADUAL\_GRAVAME\_CODIGO\_AGENTE</estadual\_gravame\_codigoAgente>

&#x20;       <estadual\_gravame\_data>ESTADUAL\_GRAVAME\_DATA</estadual\_gravame\_data>

&#x20;       <estadual\_gravame\_vigencia\_contrato>ESTADUAL\_GRAVAME\_VIGENCIA\_CONTRATO</estadual\_gravame\_vigencia\_contrato>

&#x20;       <estadual\_gravame\_documento\_financiado>ESTADUAL\_GRAVAME\_DOCUMENTO\_FINANCIADO</estadual\_gravame\_documento\_financiado>

&#x20;       <estadual\_gravame\_nome\_agente>ESTADUAL\_GRAVAME\_NOME\_AGENTE</estadual\_gravame\_nome\_agente>

&#x20;       <estadual\_gravame\_numero\_contrato>ESTADUAL\_GRAVAME\_NUMERO\_CONTRATO</estadual\_gravame\_numero\_contrato>

&#x20;       <estadual\_gravame\_restricao\_financeira>ESTADUAL\_GRAVAME\_RESTRICAO\_FINANCEIRA</estadual\_gravame\_restricao\_financeira>

&#x20;       <estadual\_intencao\_gravame\_agente>ESTADUAL\_INTENCAO\_GRAVAME\_AGENTE</estadual\_intencao\_gravame\_agente>

&#x20;       <estadual\_intencao\_gravame\_data\_inclusao>ESTADUAL\_INTENCAO\_GRAVAME\_DATA\_INCLUSAO</estadual\_intencao\_gravame\_data\_inclusao>

&#x20;       <estadual\_intencao\_gravame\_documento\_financiado>

&#x20;           ESTADUAL\_INTENCAO\_GRAVAME\_DOCUMENTO\_FINANCIADO</estadual\_intencao\_gravame\_documento\_financiado>

&#x20;       <estadual\_intencao\_gravame\_nome\_financiado>ESTADUAL\_INTENCAO\_GRAVAME\_NOME\_FINANCIADO</estadual\_intencao\_gravame\_nome\_financiado>

&#x20;       <estadual\_intencao\_gravame\_restricao\_financeira>

&#x20;           ESTADUAL\_INTENCAO\_GRAVAME\_RESTRICAO\_FINANCEIRA</estadual\_intencao\_gravame\_restricao\_financeira>

&#x20;       <intencaoNomeAgente>INTENCAO\_NOME\_AGENTE</intencaoNomeAgente>

&#x20;       <intencaoNomeFinanceira>INTENCAO\_NOME\_FINANCEIRA</intencaoNomeFinanceira>

&#x20;       <intencaoCPFCNPJFinanceira>INTENCAO\_CPFCNPJ\_FINANCEIRA</intencaoCPFCNPJFinanceira>

&#x20;       <intencaoDataInclusao>INTENCAO\_DATA\_INCLUSAO</intencaoDataInclusao>

&#x20;       <debcetesb>DEBCTESB\_VALOR</debcetesb>

&#x20;       <licexelic>LICEXELIC</licexelic>

&#x20;       <dataLimiteRestricaoTributaria>DATA\_LIMITE\_RESTRICAO\_TRIBUTARIA</dataLimiteRestricaoTributaria>

&#x20;       <ultimaAtualizacao>ULTIMA\_ATUALIZACAO</ultimaAtualizacao>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <Placa>PLACA\_VEICULO</Placa>

&#x20;       <Chassi>CHASSI\_VEICULO</Chassi>

&#x20;       <TipoVeiculo>TIPO\_VEICULO</TipoVeiculo>

&#x20;       <Fabricante>FABRICANTE\_VEICULO</Fabricante>

&#x20;       <AnoFab>ANO\_FABRICACAO</AnoFab>

&#x20;       <AnoMod>ANO\_MODELO</AnoMod>

&#x20;       <Combustivel>COMBUSTIVEL\_VEICULO</Combustivel>

&#x20;       <QtdEixos>QUANTIDADE\_EIXOS</QtdEixos>

&#x20;       <Carroceria>TIPO\_CARROCERIA</Carroceria>

&#x20;       <Regiao>REGIAO\_VEICULO</Regiao>

&#x20;       <Pais>PAIS\_ORIGEM</Pais>

&#x20;       <LocalFabricacao>LOCAL\_FABRICACAO</LocalFabricacao>

&#x20;       <Marca>MARCA\_VEICULO</Marca>

&#x20;       <ModeloCompleto>MODELO\_COMPLETO</ModeloCompleto>

&#x20;       <Modelo>MODELO\_VEICULO</Modelo>

&#x20;       <Versao>VERSAO\_VEICULO</Versao>

&#x20;       <Motor>MOTOR\_VEICULO</Motor>

&#x20;       <TipoMotor>TIPO\_MOTOR</TipoMotor>

&#x20;       <Tracao>TRACAO\_VEICULO</Tracao>

&#x20;       <Transmissao>TRANSMISSAO\_VEICULO</Transmissao>

&#x20;       <Portas>QUANTIDADE\_PORTAS</Portas>

&#x20;       <Classificacao>CLASSIFICACAO\_VEICULO</Classificacao>

&#x20;       <Comprimento>COMPRIMENTO\_VEICULO</Comprimento>

&#x20;       <MesProducao>MES\_PRODUCAO</MesProducao>

&#x20;       <PesoBruto>PESO\_BRUTO</PesoBruto>

&#x20;       <Freio>TIPO\_FREIO</Freio>

&#x20;       <DistanciaEixos>DISTANCIA\_EIXOS</DistanciaEixos>

&#x20;       <CodigoFipe>CODIGO\_FIPE</CodigoFipe>

&#x20;       <DigitoVerificador>DIGITO\_VERIFICADOR</DigitoVerificador>

&#x20;       <VerificaSerial>VERIFICA\_SERIAL</VerificaSerial>

&#x20;       <Conclusao>STATUS\_CONCLUSAO</Conclusao>

&#x20;       <QuantidadeIrregularidades>QTD\_IRREGULARIDADES</QuantidadeIrregularidades>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>INFORMACOES\_GRAVAME</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <resposta>RESPOSTA\_SINISTRO</resposta>

&#x20;       <mensagem>DESCRICAO\_SINISTRO</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <resposta>INDICIO\_SINISTRO</resposta>

&#x20;       <mensagem>DESCRICAO\_INDICIO\_SINISTRO</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2>

&#x20;       <codigo>1</codigo>

&#x20;       <mensagem>VEÍCULO COM ACIONAMENTO DE SEGURO SEM INDENIZAÇÃO INTEGRAL</mensagem>

&#x20;   </indicioSinistro2>

&#x20;   <parecerTecnico>

&#x20;       <cor>COR\_PARECER</cor>

&#x20;   </parecerTecnico>

&#x20;   <alertaDeAcidente>

&#x20;       <mensagem>Encontrado alerta de acidente ou avarias</mensagem>

&#x20;   </alertaDeAcidente>

&#x20;   <leilao>

&#x20;       <leiloes>

&#x20;           <leilao>

&#x20;               <placa>PLACA\_EXEMPLO</placa>

&#x20;               <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;               <leiloeiro>LEILOEIRO\_EXEMPLO</leiloeiro>

&#x20;               <comitente>COMITENTE\_EXEMPLO</comitente>

&#x20;               <lote>LOTE\_EXEMPLO</lote>

&#x20;               <dataLeilao>DATA\_LEILAO\_EXEMPLO</dataLeilao>

&#x20;               <patio>PATIO\_EXEMPLO</patio>

&#x20;               <idLeilao>ID\_LEILAO\_EXEMPLO</idLeilao>

&#x20;               <anoFabricacao>ANO\_FABRICACAO\_EXEMPLO</anoFabricacao>

&#x20;               <anoModelo>ANO\_MODELO\_EXEMPLO</anoModelo>

&#x20;               <marca>MARCA\_EXEMPLO</marca>

&#x20;               <modelo>MODELO\_EXEMPLO</modelo>

&#x20;               <cor>COR\_EXEMPLO</cor>

&#x20;               <nr\_motor>MOTOR\_EXEMPLO</nr\_motor>

&#x20;               <qtd\_eixos>QUANTIDADE\_EIXOS\_EXEMPLO</qtd\_eixos>

&#x20;               <combustivel>COMBUSTIVEL\_EXEMPLO</combustivel>

&#x20;               <categoriaDoVeiculo>CATEGORIA\_VEICULO\_EXEMPLO</categoriaDoVeiculo>

&#x20;               <obs>OBSERVACOES</obs>

&#x20;           </leilao>

&#x20;       </leiloes>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <constaVendaDireta>true</constaVendaDireta>

&#x20;       <mensagem>Consta venda direta</mensagem>

&#x20;       <fotos>URL\_FOTO\_1</fotos>

&#x20;       <fotos>URL\_FOTO\_2</fotos>

&#x20;       <fotos>URL\_FOTO\_3</fotos>

&#x20;       <fotos>URL\_FOTO\_4</fotos>

&#x20;       <checklist>

&#x20;           <dataInspecao/>

&#x20;           <motor/>

&#x20;           <portamalas/>

&#x20;           <frente/>

&#x20;           <frenteDireita/>

&#x20;           <frenteEsquerda/>

&#x20;           <portaFrenteDireita/>

&#x20;           <portaFrenteEsquerda/>

&#x20;           <portaTraseiraDireita/>

&#x20;           <portaTraseiraEsquerda/>

&#x20;           <traseiraDireita/>

&#x20;           <traseiraEsquerda/>

&#x20;           <ladoDireito/>

&#x20;           <ladoEsquerdo/>

&#x20;           <pneuFrenteDireita/>

&#x20;           <pneuFrenteEsquerda/>

&#x20;           <pneuTraseiraDireita/>

&#x20;           <traseira/>

&#x20;           <cacamba/>

&#x20;           <bancosDianteiros/>

&#x20;           <bancosTraseiros/>

&#x20;           <forroTeto/>

&#x20;           <teto/>

&#x20;           <carenagemDianteira/>

&#x20;           <carenagemDireita/>

&#x20;           <carenagemEsquerda/>

&#x20;           <tanqueCombustivel/>

&#x20;           <obs/>

&#x20;           <link1/>

&#x20;           <link2/>

&#x20;           <garantia/>

&#x20;       </checklist>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <constaEventoCorporativo>true</constaEventoCorporativo>

&#x20;       <mensagem>Consta evento corporativo</mensagem>

&#x20;       <fotos>URL\_FOTO\_1</fotos>

&#x20;       <fotos>URL\_FOTO\_2</fotos>

&#x20;       <fotos>URL\_FOTO\_3</fotos>

&#x20;       <fotos>URL\_FOTO\_4</fotos>

&#x20;       <checklist>

&#x20;           <dataInspecao/>

&#x20;           <motor/>

&#x20;           <portamalas/>

&#x20;           <frente/>

&#x20;           <frenteDireita/>

&#x20;           <frenteEsquerda/>

&#x20;           <portaFrenteDireita/>

&#x20;           <portaFrenteEsquerda/>

&#x20;           <portaTraseiraDireita/>

&#x20;           <portaTraseiraEsquerda/>

&#x20;           <traseiraDireita/>

&#x20;           <traseiraEsquerda/>

&#x20;           <ladoDireito/>

&#x20;           <ladoEsquerdo/>

&#x20;           <pneuFrenteDireita/>

&#x20;           <pneuFrenteEsquerda/>

&#x20;           <pneuTraseiraDireita/>

&#x20;           <traseira/>

&#x20;           <cacamba/>

&#x20;           <bancosDianteiros/>

&#x20;           <bancosTraseiros/>

&#x20;           <forroTeto/>

&#x20;           <teto/>

&#x20;           <carenagemDianteira/>

&#x20;           <carenagemDireita/>

&#x20;           <carenagemEsquerda/>

&#x20;           <tanqueCombustivel/>

&#x20;           <obs/>

&#x20;           <link1/>

&#x20;           <link2/>

&#x20;           <garantia/>

&#x20;       </checklist>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;       <leilao>

&#x20;           <placa>PLACA</placa>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <leiloeiro>LEILOEIRO</leiloeiro>

&#x20;           <comitente>COMITENTE</comitente>

&#x20;           <lote>LOTE</lote>

&#x20;           <dataLeilao>DATA\_LEILAO</dataLeilao>

&#x20;           <patio>PATIO</patio>

&#x20;           <idLeilao>ID\_LEILAO</idLeilao>

&#x20;           <anoFabricacao>ANO\_FABRICACAO</anoFabricacao>

&#x20;           <anoModelo>ANO\_MODELO</anoModelo>

&#x20;           <marca>MARCA</marca>

&#x20;           <modelo>MODELO</modelo>

&#x20;           <cor>COR</cor>

&#x20;           <nr\_motor>NUMERO\_MOTOR</nr\_motor>

&#x20;           <qtd\_eixos>QUANTIDADE\_EIXOS</qtd\_eixos>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <categoriaDoVeiculo>CATEGORIA\_VEICULO</categoriaDoVeiculo>

&#x20;           <obs>OBSERVACOES</obs>

&#x20;       </leilao>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <proprietario>

&#x20;           <nomeProprietario>NOME\_PROPRIETARIO\_EXEMPLO</nomeProprietario>

&#x20;           <documento>DOCUMENTO\_EXEMPLO</documento>

&#x20;           <placa>PLACA\_EXEMPLO</placa>

&#x20;           <ano>ANO\_EXEMPLO</ano>

&#x20;           <uf>UF\_EXEMPLO</uf>

&#x20;       </proprietario>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <precificador>

&#x20;           <Valor>VALOR\_EXEMPLO</Valor>

&#x20;           <Marca>MARCA\_EXEMPLO</Marca>

&#x20;           <Modelo>MODELO\_EXEMPLO</Modelo>

&#x20;           <AnoModelo>ANO\_MODELO\_EXEMPLO</AnoModelo>

&#x20;           <Combustivel>COMBUSTIVEL\_EXEMPLO</Combustivel>

&#x20;           <CodigoFipe>CÓDIGO\_FIPE\_EXEMPLO</CodigoFipe>

&#x20;           <MesReferencia>MÊS\_REFERÊNCIA\_EXEMPLO</MesReferencia>

&#x20;           <Autenticacao>AUTENTICAÇÃO\_EXEMPLO</Autenticacao>

&#x20;           <TipoVeiculo>TIPO\_VEICULO\_EXEMPLO</TipoVeiculo>

&#x20;           <SiglaCombustivel>SIGLA\_COMBUSTIVEL\_EXEMPLO</SiglaCombustivel>

&#x20;           <DataConsulta>DATA\_CONSULTA\_EXEMPLO</DataConsulta>

&#x20;           <Historicos>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;               <historico>

&#x20;                   <referencia>REFERENCIA\_EXEMPLO</referencia>

&#x20;                   <valor>0</valor>

&#x20;                   <status>OK</status>

&#x20;                   <variacao\_nominal>0</variacao\_nominal>

&#x20;                   <variacao\_percentual>0</variacao\_percentual>

&#x20;               </historico>

&#x20;           </Historicos>

&#x20;           <resumo>

&#x20;               <valor\_inicial>0</valor\_inicial>

&#x20;               <valor\_final>0</valor\_final>

&#x20;               <variacao\_acumulada\_nominal>0</variacao\_acumulada\_nominal>

&#x20;               <variacao\_acumulada\_percentual>0</variacao\_acumulada\_percentual>

&#x20;               <anos\_analisados>0</anos\_analisados>

&#x20;               <anos\_indisponiveis>0</anos\_indisponiveis>

&#x20;           </resumo>

&#x20;       </precificador>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <montadora>

&#x20;           <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;           <montadora>MONTADORA\_EXEMPLO</montadora>

&#x20;           <modelo>MODELO\_EXEMPLO</modelo>

&#x20;       </montadora>

&#x20;       <ocorrencias>

&#x20;           <ocorrencia>

&#x20;               <identificador>IDENTIFICADOR\_EXEMPLO</identificador>

&#x20;               <descricao>DESCRIÇÃO\_EXEMPLO</descricao>

&#x20;               <data\_registro>DATA\_REGISTRO\_EXEMPLO</data\_registro>

&#x20;           </ocorrencia>

&#x20;       </ocorrencias>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <ocorrencias>

&#x20;           <numeroInfracao>NUMERO\_INFRACAO\_EXEMPLO</numeroInfracao>

&#x20;           <detalhesInfracao>DETALHES\_INFRACAO\_EXEMPLO</detalhesInfracao>

&#x20;           <localInfracao>LOCAL\_INFRACAO\_EXEMPLO</localInfracao>

&#x20;           <detalheNumeroAutoInfracao>DETALHE\_NUMERO\_AUTO\_INFRACAO\_EXEMPLO</detalheNumeroAutoInfracao>

&#x20;           <detalheOrgaoAutuador>DETALHE\_ORGAO\_AUTUADOR\_EXEMPLO</detalheOrgaoAutuador>

&#x20;           <dataInfracao>DATA\_INFRACAO\_EXEMPLO</dataInfracao>

&#x20;           <horaInfracao>HORA\_INFRACAO\_EXEMPLO</horaInfracao>

&#x20;           <exigibilidade>EXIGIBILIDADE\_EXEMPLO</exigibilidade>

&#x20;           <codigoInfracao>CODIGO\_INFRACAO\_EXEMPLO</codigoInfracao>

&#x20;           <orgaoAutuador>ORGÃO\_AUTUADOR\_EXEMPLO</orgaoAutuador>

&#x20;           <dataCadastro>DATA\_CADASTRO\_EXEMPLO</dataCadastro>

&#x20;           <dataEmissaoPenalidade>DATA\_EMISSAO\_PENALIDADE\_EXEMPLO</dataEmissaoPenalidade>

&#x20;           <dataNotificacaoInfracao>DATA\_NOTIFICACAO\_INFRACAO\_EXEMPLO</dataNotificacaoInfracao>

&#x20;           <placa>PLACA\_EXEMPLO</placa>

&#x20;           <ufPlaca>UF\_PLACA\_EXEMPLO</ufPlaca>

&#x20;           <ufJurisdicao>UF\_JURISDICAO\_EXEMPLO</ufJurisdicao>

&#x20;           <limitePermitido>LIMITES\_PERMITIDO\_EXEMPLO</limitePermitido>

&#x20;           <medicaoConsiderada>MEDICAO\_CONSIDERADA\_EXEMPLO</medicaoConsiderada>

&#x20;           <medicaoReal>MEDICAO\_REAL\_EXEMPLO</medicaoReal>

&#x20;           <valorInfracao>VALOR\_INFRACAO\_EXEMPLO</valorInfracao>

&#x20;           <dataPagamento>DATA\_PAGAMENTO\_EXEMPLO</dataPagamento>

&#x20;           <dataRegistroPagamento>DATA\_REGISTRO\_PAGAMENTO\_EXEMPLO</dataRegistroPagamento>

&#x20;           <ufPagamento>UF\_PAGAMENTO\_EXEMPLO</ufPagamento>

&#x20;           <valorPago>VALOR\_PAGO\_EXEMPLO</valorPago>

&#x20;       </ocorrencias>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <quantidadeRegistros>QUANTIDADE\_REGISTROS\_EXEMPLO</quantidadeRegistros>

&#x20;       <duplicidades>

&#x20;           <duplicidade>

&#x20;               <chassi>CHASSI\_EXEMPLO</chassi>

&#x20;               <placa>PLACA\_EXEMPLO</placa>

&#x20;               <motor>MOTOR\_EXEMPLO</motor>

&#x20;           </duplicidade>

&#x20;       </duplicidades>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <quantidadeRegistros>QUANTIDADE\_REGISTROS\_EXEMPLO</quantidadeRegistros>

&#x20;       <desvalorizacoes>

&#x20;           <desvalorizacao>

&#x20;               <valorAno>VALOR\_ANO\_EXEMPLO</valorAno>

&#x20;               <porcentagemRelativaAnoAnterior>PERCENTAGEM\_RELATIVA\_ANO\_ANTERIOR\_EXEMPLO</porcentagemRelativaAnoAnterior>

&#x20;               <porcentagemRelativaValorInicial>PERCENTAGEM\_RELATIVA\_VALOR\_INICIAL\_EXEMPLO</porcentagemRelativaValorInicial>

&#x20;               <codigoFipe>CODIGO\_FIPE\_EXEMPLO</codigoFipe>

&#x20;               <anoModelo>ANO\_MODELO\_EXEMPLO</anoModelo>

&#x20;               <anoReferencia>ANO\_REFERENCIA\_EXEMPLO</anoReferencia>

&#x20;           </desvalorizacao>

&#x20;       </desvalorizacoes>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comercializacao>

&#x20;       <resposta>1</resposta>

&#x20;       <mensagem>CONSTA COMERCIALIZAÇÃO</mensagem>

&#x20;   </comercializacao>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Consta comunicacao de venda</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Existe dívida ativa do proprietário</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>HASH\_PESQUISA</hashPesquisa>

</conferi>

Importante

As seções historico e resumo dentro do bloco precificador só são retornadas nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

Importante

O bloco comunicacaoVenda só é retornado nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

\# Detran

O bloco detran traz as informações do Detran da UF do veículo. Para algumas UFs será apresentado o site do Detran para consulta e, em outras, poderá haver indisponibilidade. Em caso de sucesso, são retornados os dados do veículo.



Importante

O bloco detran só é retornado nas consultas quando o cliente possui permissão específica habilitada. Caso tenha interesse em contratar esse recurso, entre em contato com o time comercial da Company Conferi ou entre em contato.

Sucesso: Retorno com os dados do Detran da UF do veículo. As informações do exemplo são fictícias, apenas para teste.



Sucesso

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <informacoesVeiculo>

&#x20;           <renavam>RENAVAM</renavam>

&#x20;           <chassi>CHASSI</chassi>

&#x20;           <placa>PLACA</placa>

&#x20;           <marcaModelo>MARCA/MODELO</marcaModelo>

&#x20;           <municipio>MUNICIPIO</municipio>

&#x20;           <anoFabricacaoModelo>AAAA / AAAA</anoFabricacaoModelo>

&#x20;           <combustivel>COMBUSTIVEL</combustivel>

&#x20;           <cor>COR</cor>

&#x20;           <categoria>CATEGORIA</categoria>

&#x20;           <especieTipo>ESPECIE / TIPO</especieTipo>

&#x20;           <situacaoVeiculo>SITUACAO DO VEICULO</situacaoVeiculo>

&#x20;           <restricaoVenda>RESTRICAO A VENDA</restricaoVenda>

&#x20;       </informacoesVeiculo>

&#x20;       <debitos>

&#x20;           <ipva>

&#x20;               <totalDebitos>2.318,47</totalDebitos>

&#x20;           </ipva>

&#x20;           <dpvat>TESTE - NÃO HÁ DEBITOS DE SEGURO OBRIGATÓRIO - DPVAT</dpvat>

&#x20;           <taxaLicenciamento>137,26</taxaLicenciamento>

&#x20;           <vencimentoLicenciamento>TESTE - Vencimento em 14/08/2026</vencimentoLicenciamento>

&#x20;       </debitos>

&#x20;       <multas>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM PROCESSO DE RECURSO OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM DIVIDA ATIVA/EXEC.JUDICIAL/SOB JUDICE</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>3</quantidade>

&#x20;               <valor>R$ 587,19</valor>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS EM PROCESSO DE RECURSO NÃO OBRIGATÓRIAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - MULTAS IMPOSTAS</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <total>R$ 587,19</total>

&#x20;       </multas>

&#x20;       <autuacoes>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES NOTIFICADAS</discriminacao>

&#x20;               <quantidade>1</quantidade>

&#x20;               <valor>R$ 241,83</valor>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES EM PROCESSO DE DEFESA</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <itens>

&#x20;               <discriminacao>TESTE - AUTUAÇÕES EM PROCESSO DE NOTIFICAÇÃO</discriminacao>

&#x20;               <quantidade>NADA CONSTA</quantidade>

&#x20;               <valor/>

&#x20;           </itens>

&#x20;           <total>R$ 241,83</total>

&#x20;       </autuacoes>

&#x20;       <odometro>

&#x20;           <mensagem/>

&#x20;           <historico>

&#x20;               <titulo>TESTE - AQUISICAO DE VEICULO</titulo>

&#x20;               <data>05/03/2026</data>

&#x20;               <hodometro>84.312 km</hodometro>

&#x20;           </historico>

&#x20;           <historico>

&#x20;               <titulo>TESTE - PRIMEIRO EMPLACAMENTO</titulo>

&#x20;               <data>18/09/2021</data>

&#x20;               <hodometro>7 km</hodometro>

&#x20;           </historico>

&#x20;           <ultimoRegistro>

&#x20;               <numeroProcesso>531.7.2846193-4</numeroProcesso>

&#x20;               <motivo>TESTE - AQUISICAO DE VEICULO</motivo>

&#x20;               <data>05/03/2026</data>

&#x20;               <valorOdometro>84.312 km</valorOdometro>

&#x20;           </ultimoRegistro>

&#x20;       </odometro>

&#x20;       <crlv>

&#x20;           <licenciamento>TESTE - LICENCIAMENTO ANUAL QUITADO</licenciamento>

&#x20;           <exercicio>2026</exercicio>

&#x20;           <dataPagamento>22/04/2026</dataPagamento>

&#x20;           <valorPago>R$ 158,74</valorPago>

&#x20;           <emissaoDocumento>24/04/2026</emissaoDocumento>

&#x20;           <dataPostagem>27/04/2026</dataPostagem>

&#x20;           <numeroCorreios>TESTE - Origem: PROCESSO 531.7.2846193-4</numeroCorreios>

&#x20;       </crlv>

&#x20;       <csv>

&#x20;           <ano>2019</ano>

&#x20;           <numeroCsv>608241957</numeroCsv>

&#x20;           <discriminacao>TESTE - LIBERACAO POR ACIDENTE</discriminacao>

&#x20;       </csv>

&#x20;       <recall>

&#x20;           <nomeRecall>TESTE - Airbag lado motorista</nomeRecall>

&#x20;           <descricaoDefeito>TESTE - Airbag lado motorista</descricaoDefeito>

&#x20;           <identificadorRecall>TST2021004</identificadorRecall>

&#x20;           <dataUltimaAtualizacao>16/02/2023</dataUltimaAtualizacao>

&#x20;           <dataInicio>11/06/2021</dataInicio>

&#x20;           <dataLimiteAtendimento>10/06/2022</dataLimiteAtendimento>

&#x20;       </recall>

&#x20;   </detran>

&#x20;   ...

</conferi>

Consultar site: Informa o site do Detran da UF do veículo para consulta.



Consultar site

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <situacao>Consultar site</situacao>

&#x20;       <url>URL</url>

&#x20;   </detran>

&#x20;   ...

</conferi>

Sistema Indisponível: O Detran da UF do veículo está indisponível.



Sistema Indisponível

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS" codigoConsulta="1234567" status="Liberado"/>

&#x20;   ...

&#x20;   <detran>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </detran>

&#x20;   ...

</conferi>

Sites do Detran informados no campo url, por UF:



UF	Link

AC	https://www.ac.getran.com.br/site/apps/veiculo/consulta/filtro-consulta-veiculo.jsp

AL	https://www.detran.al.gov.br/veiculos/consulta-veiculo/menu\_lateral

AM	https://digital.detran.am.gov.br/?openModalVeiculo=%2Fveiculo

AP	https://www.detran.ap.gov.br/detranap/veiculo/consulta-de-veiculos/

BA	https://servicos.detran.ba.gov.br/

CE	https://sistemas.detran.ce.gov.br/meudetran/

DF	https://portal.detran.df.gov.br/#/home

ES	https://detran.es.gov.br/veiculos

GO	https://www.go.gov.br/servicos/servico/consultar-veiculo--ipva-multas-e-crlv

MA	https://portal.detrannet.detran.ma.gov.br/Veiculo/Veiculos.cshtml

MG	https://transito.mg.gov.br/veiculos/situacao-do-veiculo/consulta-de-situacao-do-veiculo

MS	https://www.meudetran.ms.gov.br/veiculo.php#

MT	https://www.detran.mt.gov.br/

PA	https://www.detran.pa.gov.br/sistransito/detran-web/servicos/veiculos/indexRenavam.jsf

PB	https://wsdetran.pb.gov.br/detran-portal-servicos/servlet/easynat-app?op=S30

PE	https://www.detran.pe.gov.br/veiculos

PI	http://taxas.detran.pi.gov.br/licenciamento/index.jsf

PR	https://www.extratodebito.detran.pr.gov.br/detranextratos/geraExtrato.do?action=iniciarProcesso

RJ	https://www.detran.rj.gov.br/consultas/consultas-drv/nada-consta.html

RN	https://www2.detran.rn.gov.br/externo/consultarveiculo.asp

RS	https://pcsdetran.rs.gov.br/login?redirectUrl=%2Fconsulta-veiculo

RO	https://centralservicos.detran.ro.gov.br/consulta/veiculo

RR	https://www.rr.getran.com.br/site/apps/veiculo/filtroplacarenavam-consultaveiculo.jsp

SC	https://www.detran.sc.gov.br/veiculos/consultas/

SE	https://www.detran.se.gov.br/portal/?pg=cons\_veiculo

SP	https://www.detran.sp.gov.br/wps/portal/portaldetran/cidadao/home

TO	https://www.to.gov.br/detran/veiculos

\# Nenhum Registro Encontrado

O retorno de nenhum registro encontrado descreve que o veículo não foi encontrado nas bases consultadas.



Resposta

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="1" mensagem="Possui Registro" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Liberado" />

&#x20;   <agregados>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <alertaCodigo>0</alertaCodigo>

&#x20;       <alertaMensagem>VEÍCULO NÃO POSSUÍ HISTÓRICO DE ROUBO E FURTO</alertaMensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <resposta>NAO</resposta>

&#x20;       <mensagem>NAO EXISTE SINISTRO DE INDENIZAÇÃO INTEGRAL</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <resposta>0</resposta>

&#x20;       <mensagem>Não existe indício de sinistro</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2>

&#x20;       <codigo>0</codigo>

&#x20;       <mensagem>Nao Consta</mensagem>

&#x20;   </indicioSinistro2>

&#x20;   <parecerTecnico>

&#x20;       <cor>verde</cor>

&#x20;   </parecerTecnico>

&#x20;   <leilao>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <Mensagem>Recall não encontrado</Mensagem>

&#x20;       <Mensagem2>O veículo pesquisado não possui Recall pendente ou não pertence a nenhum Recall

&#x20;           divulgado pelas montadoras a partir de 17/03/2011. Para períodos anteriores, entre em

&#x20;           contato diretamente com o fabricante do veículo.</Mensagem2>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <mensagem>Nenhum registro encontrado nas bases consultadas</mensagem>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comercializacao>

&#x20;       <resposta>0</resposta>

&#x20;       <mensagem>Não Consta</mensagem>

&#x20;   </comercializacao>

&#x20;   <scpc>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </scpc>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Não consta comunicacao de venda</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Não localizado dívida ativa do proprietário</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>

&#x20;       HASH\_PESQUISA

&#x20;   </hashPesquisa>

</conferi>

\# Sistema Indisponível

Em caso de retorno de sistema indisponível, as bases consultadas estão temporariamente fora de serviço. No entanto, a consulta foi registrada e poderá ser atualizada assim que as bases forem restabelecidas.



Resposta de Erro

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   <solicitacao acao="4" mensagem="Sistema Indisponível" dataHora="DD/MM/AAAA HH:MM:SS"

&#x20;       codigoConsulta="1234567" status="Em processamento" />

&#x20;   <agregados>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </agregados>

&#x20;   <bin>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </bin>

&#x20;   <csv>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </csv>

&#x20;   <historicoRouboFurto>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </historicoRouboFurto>

&#x20;   <estadual>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </estadual>

&#x20;   <decodificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </decodificador>

&#x20;   <gravame>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </gravame>

&#x20;   <sinistro>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </sinistro>

&#x20;   <indicioSinistro>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </indicioSinistro>

&#x20;   <indicioSinistro2/>

&#x20;   <parecerTecnico>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </parecerTecnico>

&#x20;   <leilao>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </leilao>

&#x20;   <vendaDireta>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </vendaDireta>

&#x20;   <eventoCorporativo>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </eventoCorporativo>

&#x20;   <historicoProprietarios>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </historicoProprietarios>

&#x20;   <precificador>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </precificador>

&#x20;   <recall>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </recall>

&#x20;   <renainf>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </renainf>

&#x20;   <duplicidadeMotor>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </duplicidadeMotor>

&#x20;   <desvalorizacaoFipe>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </desvalorizacaoFipe>

&#x20;   <comunicacaoVenda>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </comunicacaoVenda>

&#x20;   <dividaAtivaDocumento>

&#x20;       <mensagem>Sistema Indisponível</mensagem>

&#x20;   </dividaAtivaDocumento>

&#x20;   <hashPesquisa>HASH\_PESQUISA</hashPesquisa>

</conferi>

\# Hash de Pesquisa

O Hash de Pesquisa, localizado no atributo hashPesquisaé um identificador exclusivo para sua consulta na Company Conferi. Utilizando esse hash em conjunto com a URL abaixo, você poderá acessar a consulta diretamente.



Localização de Hash de Pesquisa

XML

JSON



<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<conferi>

&#x20;   ...

&#x20;   <hashPesquisa>HASH\_GENERICO</hashPesquisa>

</conferi>

URL



POST

https://companyconferi.com.br/areadocliente/consulta/veiculo/{HASH-PESQUISA}



