'use strict'

const { manage_multiple_uploads } = use('App/Helpers')
const Image = use('App/Models/Image')

class ImageController {
    async bulkUpload({ request, response }) {
        const fileJar = request.file('images', {
            types: ['image'],
            size: '2mb'
        })

        let files = await manage_multiple_uploads(fileJar)
        let images = []
        await Promise.all(
            files.successes.map(async file => {
                let image = await Image.create({
                    path: file.fileName,
                    size: file.size,
                    original_name: file.clientName,
                    extension: file.subtype
                })
                images.push(image)
            })
        )

        return response
            .status(201)
            .send({ successes: images, errors: files.errors })
    }

    async index({ request, response }) {
        let images = await Image.query().paginate()
        return response.send(images)
    }

    async store({ request, response }) {
        try {
            // Tratamento da imagem
            const image = request.file('image', {
                types: ['image'],
                size: '2mb'
            })

            let file = {}
            if (image) {
                file = await manage_single_upload(image)
                if (file.moved()) {
                    const imagem = await Image.create({
                        path: file.fileName,
                        size: file.size,
                        original_name: file.clientName,
                        extension: file.subtype
                    })

                    return response.status(201).send(imagem)
                }
            }
            return response
                .status(400)
                .send({ message: 'Não foi possível processar esta imagem' })
        } catch (e) {
            return response.status(500).send({
                message: 'Não foi possível processar a sua soliticação',
                error: e.message
            })
        }
    }

    async show({ request, response, params }) {
        const image = await Image.find(params.id)
        return response.send(image)
    }

    async destroy({ request, response, params }) {
        try {
            const image = await Image.findOrFail(params.id)
            await image.delete()
            return response
                .status(410)
                .send({ message: 'Imagem deletada com sucesso!' })
        } catch (e) {
            return response.status(400).send({
                message: 'Não foi possível processar a sua soliticação',
                error: e.message
            })
        }
    }
}

module.exports = ImageController
