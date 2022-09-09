"use strict";

const { compareChunksNatural } = require("webpack/lib/util/comparators");
const {
	getShortChunkName,
	getLongChunkName,
	assignNames,
	getUsedChunkIds,
	assignAscendingChunkIds
} = require("webpack/lib/ids/IdHelpers");

/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/Compiler")} Compiler */
/** @typedef {import("webpack/lib/Module")} Module */

class NamedChunkIdsPlugin {
	constructor(options) {
		this.delimiter = (options && options.delimiter) || "-";
		this.context = options && options.context;
		this.salt = options && options.salt || '';
	}

	/**
	 * Apply the plugin
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap("NamedChunkIdsPlugin", compilation => {
			const { hashFunction } = compilation.outputOptions;
			compilation.hooks.chunkIds.tap("NamedChunkIdsPlugin", chunks => {
				const chunkGraph = compilation.chunkGraph;
				const context = this.context ? this.context : compiler.context;
				const delimiter = this.delimiter;
				const salt = this.salt ? [delimiter, this.salt].join('') : '';

				const unnamedChunks = assignNames(
					Array.from(chunks).filter(chunk => {
						if (chunk.name) {
							chunk.id = chunk.name + salt;
							chunk.ids = [chunk.name + salt];
						}
						return chunk.id === null;
					}),
					chunk =>
						getShortChunkName(
							chunk,
							chunkGraph,
							context,
							delimiter,
							hashFunction,
							compiler.root
						),
					chunk =>
						getLongChunkName(
							chunk,
							chunkGraph,
							context,
							delimiter,
							hashFunction,
							compiler.root
						),
					compareChunksNatural(chunkGraph),
					getUsedChunkIds(compilation),
					(chunk, name) => {
						chunk.id = name + salt;
						chunk.ids = [name + salt];
					}
				);
				if (unnamedChunks.length > 0) {
					assignAscendingChunkIds(unnamedChunks, compilation);
				}
			});
		});
	}
}

module.exports = NamedChunkIdsPlugin;
