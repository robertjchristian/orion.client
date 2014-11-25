/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *	 IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env amd */
define([
'logger'
], function(Logger) {
	return function(context) {
		"use strict";  //$NON-NLS-0$

        function hasCallbackComment(node) {
            if(node.leadingComments) {
                var len = node.leadingComments.length;
                for(var i = 0; i < len; i++) {
                    var comment = node.leadingComments[i];
                    if(comment.type === 'Block' && /.*\*\s*(?:@callback)\s+/.test(comment.value)) {
                        return true;
                    }
                }
            }
            return false;
        }

		function check(node) {
			try {
				var scope = context.getScope();
				var kids = scope.childScopes;
				if(scope.functionExpressionScope && kids && kids.length) {
					scope = kids[0];
				}
				scope.variables.forEach(function(variable) {
					if (!variable.defs.length || variable.defs[0].type !== "Parameter") { // only care about parameters  //$NON-NLS-0$
						return;
					}
					var defnode = variable.defs[0].name;
					if (!variable.references.length) {
					    var pid = 'no-unused-params';
					    if(node.type === 'FunctionExpression') {
					        pid += '-expr';
					        if(hasCallbackComment(node)) {
					            return;
					        }
					        if(hasCallbackComment(node.parent)) {
					            return;
					        }
					    }
						context.report(defnode, "Parameter '${0}' is never used.", {0:defnode.name, pid: pid}); //$NON-NLS-0
					}
				});
			}
			catch(ex) {
				Logger.log(ex);
			}
		}

		return {
			"FunctionDeclaration": check,  //$NON-NLS-0$
			"FunctionExpression": check  //$NON-NLS-0$
		};
	};
});