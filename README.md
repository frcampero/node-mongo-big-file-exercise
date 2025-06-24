# node-mongo-big-file-exercise

Este repositorio contiene la solucion que encontre para el ejercicio propuesto.

## Como lo resolvi:

- Utilice CSV-Parser para poder interpretar y procesar el contenido del archivo CSV.
- Implemente un procesamiento por lotes de 1000 registros para insertar en MongoDB de una forma eficiente usando "insertMany"
- Si alcanza el tamaño del batch, el procesamiento se pausa, se insertan los datos y luego se reanuda.
- Al finalizar, el archivo temporal se elimina del disco.

Tambien se utilizacion validaciones iniciales, como tambien manejos de errores en los eventos del stream.