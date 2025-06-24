const Records = require('./records.model');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const upload = async (req, res) => {
    const {file} = req;


    //Si no se recibe ningun archivo, respondemos con error 400 (validacion)
    if (!file) {
        return res.status(400).json({error: 'No se recibio ningun archivo'})
    }

    //Si no existe la carpeta _temp, se crea automaticamente
    const tempDir = path.join(__dirname, "..", "_temp");
        if(!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir)
        }

    //Asignamos la ruta del archivo temporal
    const filePath = path.join(__dirname, '..', '_temp', file.filename);

    //Tamaño del lote a insertar en cada operacion
    const BATCH_SIZE = 1000;
    let batch = [];

    try {

        //Creamos stream de lectura y para luego parsear el CSV
        const stream = fs.createReadStream(filePath).pipe(csv());

        //Leemos cada linea del CSV
        stream.on('data', async (data) => {
            batch.push(data);
            
            //Si se alcanzo el tamaño definido, pausamos el stream e insertamos el lote
            if(batch.length >= BATCH_SIZE) {
                stream.pause();
                try {
                    await Records.insertMany(batch, { ordered: false}); //Insertamos los datos en MongoDB
                    batch = [] // Limpiamos el lote
                } catch (err) {
                    console.error('Error al insertar batch', err)
                } finally {
                    stream.resume() //Volvemos a leer de nuevo
                }
            }

        })

        //Cuando se finaliza la lectura del archivo
        stream.on('end', async ()=> {

            //Si quedo incompleto insertamos el ultimo lote
            if (batch.length > 0) {
                try {
                    await Records.insertMany(batch, { ordered: false })
                } catch (err) {
                    console.error('Error al insertar final:', err);
                }
            }

            //Borramos el archivo temporal
            fs.unlinkSync(filePath)
            return res.status(200).json({ message: 'Archivo procesado correctamente'})
        })

        //Si hubo un error en la lectura del archivo iniciamos este evento
        stream.on('error', (err) => {
            console.error('No se pudo procesar el archivo: ', err)
            return res.status(500).json({error: 'Error. No se pudo procesar el archivo.'})
        })

    } catch (err) {
        console.error("Error: ", err)
        return res.status(500).json({ error: 'Error inesperado'})
    }



};

const list = async (_, res) => {
    try {
        const data = await Records
            .find({})
            .limit(10)
            .lean();
        
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    upload,
    list,
};