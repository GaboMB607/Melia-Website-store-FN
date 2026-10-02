/* ==========================================================================
   Melia · Catálogo
   Precios en COP tomados de las etiquetas. Las descripciones son texto de
   marketing editable: ajústalas a la información real de cada cosecha.
   ========================================================================== */
(function (Melia) {
  'use strict';

  Melia.products = {
    gota: {
      id: 'gota',
      name: 'Gota',
      type: 'Miel de eucalipto',
      price: 12000,
      image: 'assests/imagenes/producto_gota.png',
      alt: 'Frasco de miel Melia Gota, miel de eucalipto',
      description:
        'Intensa y ligeramente balsámica, con un final fresco que recuerda al bosque de eucalipto. ' +
        'Una miel con carácter, perfecta para acompañar tus mañanas y las noches frías.',
      notes: ['Balsámica', 'Herbal', 'Intensa'],
      pairing: 'Infusiones, té caliente y bebidas con limón y jengibre.',
    },
    colmena: {
      id: 'colmena',
      name: 'Colmena',
      type: 'Miel de pino',
      price: 18000,
      image: 'assests/imagenes/producto_colmena.png',
      alt: 'Frasco de miel Melia Colmena, miel de pino',
      description:
        'Oscura, aromática y menos dulce que una miel de flor. Sus notas a madera y malta ' +
        'la convierten en la favorita de quienes buscan un sabor profundo y elegante.',
      notes: ['Amaderada', 'Malta', 'Suave dulzor'],
      pairing: 'Yogur natural, panes artesanales y quesos maduros.',
    },
    enjambre: {
      id: 'enjambre',
      name: 'Enjambre',
      type: 'Miel de frailejón',
      price: 25000,
      image: 'assests/imagenes/producto_enjambre.png',
      alt: 'Frasco de miel Melia Enjambre, miel de frailejón',
      description:
        'Nace en el páramo andino, entre frailejones y niebla. Delicada y floral, con un ' +
        'toque herbal único. Una cosecha pequeña y muy especial.',
      notes: ['Floral', 'Herbal', 'Delicada'],
      pairing: 'Postres finos, frutas frescas o directamente a cucharadas.',
    },
    reina: {
      id: 'reina',
      name: 'Reina',
      type: 'Miel multifloral',
      price: 50000,
      image: 'assests/imagenes/producto_reina.png',
      alt: 'Frasco de miel Melia Reina, miel multifloral',
      description:
        'Nuestra joya: el néctar de cientos de flores silvestres reunido en un sabor redondo, ' +
        'aromático y generoso. Nuestro frasco más grande, pensado para compartir o regalar.',
      notes: ['Redonda', 'Aromática', 'Dulce'],
      pairing: 'Repostería, cocina de autor y como regalo especial.',
    },
  };
})(window.Melia = window.Melia || {});
