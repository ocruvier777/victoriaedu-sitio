/* ==========================================================================
   Puntajes de corte del IPN — nivel superior
   --------------------------------------------------------------------------
   QUÉ SON ESTOS NÚMEROS

   El IPN NO publica un número mínimo de aciertos por carrera. El corte se
   genera solo: ordenan a todos los sustentantes de mayor a menor y el último
   que alcanza lugar define, a posteriori, el puntaje de esa carrera. Por eso
   cambia cada convocatoria según demanda y cupo.

   Es decir: son máximos históricos observados, NO un requisito institucional.
   La página lo dice de forma explícita y esa advertencia no debe quitarse.

   --------------------------------------------------------------------------
   TODO(Óscar) ANTES DE PUBLICAR — dos cosas:

   1. VERIFICAR LA FUENTE. Estos datos circulan atribuidos a una solicitud de
      transparencia al IPN (folio 330021824003627). No pudimos comprobar ese
      folio de forma independiente. Verifícalo en la Plataforma Nacional de
      Transparencia antes de publicar, o cambia `fuente` de abajo.

   2. MEJOR AÚN: METE TU PROPIA SOLICITUD. Es gratis y tarda unos días.
      Te devuelve datos con tu folio, tu fecha y tu convocatoria — y deja de
      ser la misma tabla que ya tienen todos los demás cursos.

   3. FALTA EL PERIODO. La fuente no especifica a qué convocatoria corresponden.
      Sin año, el dato orienta pero no sirve para decidir. Complétalo en
      `fuente.periodo`.
   ========================================================================== */

window.CORTES_IPN = {

  fuente: {
    // TODO(Óscar): verificar o sustituir por la solicitud propia.
    texto: 'Datos del IPN obtenidos por solicitud de transparencia',
    folio: '330021824003627',
    periodo: null,          // TODO(Óscar): p. ej. '2024-2025'
    verificado: false,      // poner true solo cuando esté comprobado
  },

  areas: {
    ifm: 'Ingeniería y Ciencias Físico-Matemáticas',
    cmb: 'Ciencias Médico Biológicas',
    csa: 'Ciencias Sociales y Administrativas',
  },

  /* [escuela, carrera, 1ª convocatoria, 2ª convocatoria]
     null = esa carrera no abrió en la segunda convocatoria */
  ifm: [
    ['ENCB', 'Ingeniería Bioquímica', 88, 58],
    ['ENCB', 'Ingeniería en Sistemas Ambientales', 70, 53],
    ['ESCOM', 'Ingeniería en Inteligencia Artificial', 108, 103],
    ['ESCOM', 'Ingeniería en Sistemas Computacionales', 97, 94],
    ['ESCOM', 'Ciencia de Datos', 99, 74],
    ['ESFM', 'Ingeniería Matemática', 95, 55],
    ['ESFM', 'Física y Matemáticas', 91, 72],
    ['ESFM', 'Matemática Algorítmica', 70, null],
    ['ESIA Tecamachalco', 'Ingeniero Arquitecto', 86, 88],
    ['ESIA Ticomán', 'Ingeniería en Meteorología', 70, 51],
    ['ESIA Ticomán', 'Ingeniería Geofísica', 70, 52],
    ['ESIA Ticomán', 'Ingeniería Geológica', 70, 50],
    ['ESIA Ticomán', 'Ingeniería Petrolera', 81, 60],
    ['ESIA Ticomán', 'Ingeniería Topográfica y Geodésica', 70, 54],
    ['ESIA Zacatenco', 'Ingeniería Civil', 80, 83],
    ['ESIME Azcapotzalco', 'Ingeniería en Robótica Industrial', 98, 71],
    ['ESIME Azcapotzalco', 'Ingeniería en Sistemas Automotrices', 87, 70],
    ['ESIME Azcapotzalco', 'Ingeniería Mecánica', 99, 75],
    ['ESIME Culhuacán', 'Ingeniería en Computación', 72, 52],
    ['ESIME Culhuacán', 'Ingeniería en Comunicaciones y Electrónica', 99, 55],
    ['ESIME Culhuacán', 'Ingeniería en Sistemas Automotrices', 83, 72],
    ['ESIME Culhuacán', 'Ingeniería Mecánica', 94, 55],
    ['ESIME Ticomán', 'Ingeniería Aeronáutica', 101, 87],
    ['ESIME Ticomán', 'Ingeniería en Sistemas Automotrices', 86, 72],
    ['ESIME Zacatenco', 'Ingeniería Eléctrica', 99, 76],
    ['ESIME Zacatenco', 'Ingeniería en Comunicaciones y Electrónica', 93, 50],
    ['ESIME Zacatenco', 'Ingeniería en Control y Automatización', 95, 50],
    ['ESIME Zacatenco', 'Ingeniería en Sistemas Automotrices', 92, 86],
    ['ESIME Zacatenco', 'Ingeniería Fotónica', 70, 58],
    ['ESIQIE', 'Ingeniería en Metalurgia y Materiales', 70, 51],
    ['ESIQIE', 'Ingeniería Química Industrial', 93, 53],
    ['ESIQIE', 'Ingeniería Química Petrolera', 74, 50],
    ['ESIT', 'Ingeniería Textil', 95, 58],
    ['UPIBI', 'Ingeniería Ambiental', 77, 52],
    ['UPIBI', 'Ingeniería Biomédica', 105, 74],
    ['UPIBI', 'Ingeniería Biotecnológica', 99, 82],
    ['UPIBI', 'Ingeniería en Alimentos', 87, 56],
    ['UPIBI', 'Ingeniería Farmacéutica', 99, 68],
    ['UPIEM', 'Ingeniería en Movilidad Urbana', 70, 53],
    ['UPIEM', 'Ingeniería en Negocios Energéticos Sustentables', 70, 57],
    ['UPIEM', 'Ingeniería en Sistemas Energéticos y Redes Inteligentes', 70, 50],
    ['UPIICSA', 'Ingeniería en Informática', 88, 85],
    ['UPIICSA', 'Ingeniería en Transporte', 99, 58],
    ['UPIICSA', 'Ingeniería Ferroviaria', 70, 50],
    ['UPIICSA', 'Ingeniería Industrial', 75, 75],
    ['UPIICSA', 'Ciencias de la Informática', 91, 52],
    ['UPIIG', 'Ingeniería Aeronáutica', 78, 53],
    ['UPIIG', 'Ingeniería Biotecnológica', 70, 53],
    ['UPIIG', 'Ingeniería en Sistemas Automotrices', 92, 51],
    ['UPIIG', 'Ingeniería Farmacéutica', 70, 51],
    ['UPIIG', 'Ingeniería Industrial', 70, 58],
    ['UPIIH', 'Ingeniería en Sistemas Automotrices', 99, 54],
    ['UPIIH', 'Ingeniería Mecatrónica', 80, 50],
    ['UPIIP', 'Ingeniería Biotecnológica', 71, 53],
    ['UPIIP', 'Ingeniería Civil', 70, 54],
    ['UPIIP', 'Ingeniería Ferroviaria', 70, 52],
    ['UPII Puebla', 'Ingeniería en Alimentos', 113, 95],
    ['UPII Puebla', 'Ingeniería en Control y Automatización', 111, 96],
    ['UPII Puebla', 'Ingeniería en Inteligencia Artificial', 125, 117],
    ['UPII Puebla', 'Ingeniería en Sistemas Automotrices', 120, 121],
    ['UPII Puebla', 'Ciencia de Datos', 107, 108],
    ['UPIIT', 'Ingeniería Biotecnológica', 84, null],
    ['UPIIT', 'Ingeniería en Transporte', 71, null],
    ['UPIITA', 'Ingeniería Biónica', 94, 64],
    ['UPIITA', 'Ingeniería en Energía', 73, 54],
    ['UPIITA', 'Ingeniería Mecatrónica', 105, 85],
    ['UPIITA', 'Ingeniería Telemática', 70, 51],
    ['UPIIZ', 'Ingeniería Ambiental', 62, null],
    ['UPIIZ', 'Ingeniería en Alimentos', 65, null],
    ['UPIIZ', 'Ingeniería en Inteligencia Artificial', 61, null],
    ['UPIIZ', 'Ingeniería en Sistemas Computacionales', 67, null],
    ['UPIIZ', 'Ingeniería Mecatrónica', 66, null],
    ['UPIIZ', 'Ingeniería Metalúrgica', 64, null],
  ],

  cmb: [
    ['CICS Milpa Alta', 'Enfermería', 89, 77],
    ['CICS Milpa Alta', 'Nutrición', 93, 77],
    ['CICS Milpa Alta', 'Odontología', 102, 84],
    ['CICS Milpa Alta', 'Optometría', 73, 62],
    ['CICS Milpa Alta', 'Médico Cirujano y Partero', 113, 98],
    ['CICS Santo Tomás', 'Odontología', 106, 116],
    ['CICS Santo Tomás', 'Optometría', 95, null],
    ['CICS Santo Tomás', 'Psicología', 93, null],
    ['ENCB', 'Biología', 98, 80],
    ['ENCB', 'Químico Bacteriólogo Parasitólogo', 101, 82],
    ['ENCB', 'Químico Farmacéutico Industrial', 100, 85],
    ['ENMH', 'Médico Cirujano y Homeópata', 104, 90],
    ['ENMH', 'Médico Cirujano y Partero', 109, 95],
    ['ESEO', 'Enfermería', 92, 92],
    ['ESEO', 'Enfermería y Obstetricia', 94, 94],
    ['ESM', 'Médico Cirujano y Partero', 114, 91],
  ],

  csa: [
    ['CICS Milpa Alta', 'Trabajo Social', 75, 64],
    ['ENBA', 'Archivonomía', 70, 52],
    ['ENBA', 'Biblioteconomía', 70, 50],
    ['ESCA Santo Tomás', 'Contador Público', 83, null],
    ['ESCA Santo Tomás', 'Administración y Desarrollo Empresarial', 94, null],
    ['ESCA Santo Tomás', 'Mercadotecnia Digital', 95, null],
    ['ESCA Santo Tomás', 'Negocios Digitales', 85, null],
    ['ESCA Santo Tomás', 'Negocios Internacionales', 95, null],
    ['ESCA Santo Tomás', 'Relaciones Comerciales', 76, null],
    ['ESCA Tepepan', 'Negocios Internacionales', 99, 90],
    ['ESCA Tepepan', 'Contador Público', 86, 95],
    ['ESCA Tepepan', 'Relaciones Comerciales', 91, 83],
    ['ESE', 'Economía', 94, 85],
    ['EST', 'Turismo', 76, 98],
    ['UPIICSA', 'Administración Industrial', 99, 84],
    ['UPIIP', 'Turismo Sustentable', 70, 55],
  ],
};

/* Aplana las tres áreas en una sola lista de objetos. */
window.CORTES_IPN.lista = ['ifm', 'cmb', 'csa'].reduce(function (acc, area) {
  window.CORTES_IPN[area].forEach(function (f) {
    acc.push({ area: area, escuela: f[0], carrera: f[1], c1: f[2], c2: f[3] });
  });
  return acc;
}, []);

/* Lista de escuelas únicas, ordenada. */
window.CORTES_IPN.escuelas = window.CORTES_IPN.lista
  .map(function (r) { return r.escuela; })
  .filter(function (v, i, a) { return a.indexOf(v) === i; })
  .sort(function (a, b) { return a.localeCompare(b, 'es'); });
