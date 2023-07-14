const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const formQueries = require('@database/queries/forms')
const utils = require('@generics/utils')
const KafkaProducer = require('@generics/kafka-communication')
const ObjectId = require('mongoose').Types.ObjectId
// const form = require('@generics/form')

module.exports = class FormsHelper {
	/**
	 * Create Form.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Form creation data.
	 */

	static async create(bodyData) {
		try {
			const form = await formQueries.findOne({ where: { type: bodyData.type } })
			if (form) {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			await formQueries.create(bodyData)
			await utils.internalDel('formVersion')
			await KafkaProducer.clearInternalCache('formVersion')
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FORM_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update Form.
	 * @method
	 * @name update
	 * @param {Object} bodyData
	 * @returns {JSON} - Update form data.
	 */

	static async update(id, bodyData) {
		try {
			let filter = {}

			if (id) {
				filter = { where: { id: id } }
			} else {
				filter = {
					where: {
						type: bodyData.type,
						sub_type: bodyData.sub_type,
						'data.templateName': bodyData.data.templateName,
					},
				}
			}

			const result = await formQueries.updateOneForm(bodyData, filter)

			if (result === 'ENTITY_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ENTITY_NOT_FOUND') {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			await utils.internalDel('formVersion')
			await KafkaProducer.clearInternalCache('formVersion')
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'FORM_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Read Form.
	 * @method
	 * @name read
	 * @param {Object} bodyData
	 * @returns {JSON} - Read form data.
	 */

	static async read(id, bodyData) {
		try {
			let filter = {}

			if (id) {
				filter = { where: { id: id } }
			} else {
				filter = {
					where: {},
				}
				if (bodyData.type) {
					filter.where.type = bodyData.type
				}
				if (bodyData.sub_type) {
					filter.where.sub_type = bodyData.sub_type
				}
				if (bodyData.templateName) {
					filter.where['data.templateName'] = bodyData.templateName
				}
			}

			const form = await formQueries.findOne(filter)

			if (!form) {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FORM_FETCHED_SUCCESSFULLY',
				result: form ? form : {},
			})
		} catch (error) {
			throw error
		}
	}
	static async readAllFormsVersion() {
		try {
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FORM_VERSION_FETCHED_SUCCESSFULLY',
				result: (await form.getAllFormsVersion()) || {},
			})
		} catch (error) {
			return error
		}
	}
}
