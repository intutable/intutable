export {}

/**
 * Überglegung: Eine `VirtualTable` nutzen, um Daten zu updaten.
 * Diese wird als State in React benutzt und reagiert auf Änderungen, indem diese validiert (`ProxyValidator`) und geupdatet werden.
 *
 *
 * • Private Props für Typ, Update-Status etc. Dann einen zusätzlichen State in React der auf diese Update-Prop referiert, die Updates pusht etc.
 *
 * • kann überprüfen, wenn die Daten einer Eigenschaft einer Row verändert werden, ob diese auch in der entsprechenden Col definiert sind.
 *
 * • lazy initialization: weitere Rows erst laden, wenn sie benötigt werden
 *
 * • das Interface könnte bspw. wie folgt aussehen:
 *
 * <pre>
 * {
 *  [rowID: number]: {
 *      data: {…} // get: Props gegenchecken mit Col und Daten aus Row
 *      meta: {…} // get: aus der entsprechenden Col gebildet
 *  }
 * }
 * </pre>
 *
 * für SET wird ein Validator eingesetzt.
 *
 */

// eslint-disable-next-line no-undef
const VirtualTable = new Proxy(
    {},
    {
        set: (target, property) => {
            return Reflect.get(target, property)
        },
        has: (target, property) => {
            return Reflect.has(target, property)
        },
    }
)
