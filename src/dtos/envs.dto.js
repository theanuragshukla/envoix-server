/**
 * @swagger
 * components:
 *   schemas:
 *     EnvironmentBase:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Production"
 *         env_path:
 *           type: string
 *           example: "/app/config"
 *       required:
 *         - name
 *
 *     EnvironmentBaseResponseDTO:
 *       type: object
 *       properties:
 *         env_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           example: "Production"
 *
 *     EnvironmentCreateDTO:
 *       allOf:
 *         - $ref: '#/components/schemas/EnvironmentBase'
 *         - type: object
 *           properties:
 *             env_data:
 *               type: string
 *               example: "DB_HOST=localhost\nDB_PORT=5432"
 *             password:
 *               type: string
 *               format: password
 *               example: "my_secure_password"
 *               minLength: 8
 *           required:
 *             - password
 * 
 * 
 *     EnvironmentListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/APIResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EnvironmentBaseResponseDTO'
 * 
 *     EnvironmentOperationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         msg:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/EnvironmentResponseDTO'
 *     EnvironmentUpdateDTO:
 *       allOf:
 *         - type: object
 *           properties:
 *             env_data:
 *               type: string
 *               example: "DB_HOST=localhost\nDB_PORT=5432"
 *             password:
 *               type: string
 *               format: password
 *               example: "my_secure_password"
 *               minLength: 8
 *           required:
 *             - password
 *             - env_data
 *
 *
 *     EnvironmentResponseDTO:
 *       type: object
 *       properties:
 *         env_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           example: "Production"
 *         env_path:
 *           type: string
 *           example: "/app/config"
 * 
 *     EnvironmentDetailsDTO:
 *       allOf:
 *         - $ref: '#/components/schemas/EnvironmentResponseDTO'
 *         - type: object
 *           properties:
 *             permissions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PermissionDTO'
 * 
 *     PermissionDTO:
 *       type: object
 *       properties:
 *         user_email:
 *           type: string
 *           format: email
 *           example: "collaborator@example.com"
 *         permission:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["pull", "push", "add_user", "update_user", "remove_user", "admin"]
 * 
 *     AccessEnvDTO:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           example: "my_secure_password"
 *         oneTimePassword:
 *           type: string
 *           description: "Required if password hasn't been changed yet"
 *       required:
 *         - password
 * 
 */
