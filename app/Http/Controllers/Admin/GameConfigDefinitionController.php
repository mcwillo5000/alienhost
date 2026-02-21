<?php
namespace Pterodactyl\Http\Controllers\Admin;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\GameConfigDefinition;
use Pterodactyl\Models\GameConfigFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
class GameConfigDefinitionController extends Controller
{
    /**
     * Display a listing of game config definitions.
     */
    public function index()
    {
        return view('admin.game-configs.index');
    }
    /**
     * Get all game config definitions with their files (API).
     */
    public function list(): JsonResponse
    {
        $definitions = GameConfigDefinition::with('configFiles')
            ->orderBy('game_name')
            ->get();
        return response()->json($definitions);
    }
    /**
     * Store a newly created game config definition.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_type' => 'required|string|unique:game_config_definitions,game_type|max:255',
            'game_name' => 'required|string|max:255',
        ]);
        $definition = GameConfigDefinition::create($validated);
        return response()->json($definition->load('configFiles'), 201);
    }
    /**
     * Display the specified game config definition.
     */
    public function show(GameConfigDefinition $gameConfigDefinition): JsonResponse
    {
        return response()->json($gameConfigDefinition->load('configFiles'));
    }
    /**
     * Update the specified game config definition.
     */
    public function update(Request $request, GameConfigDefinition $gameConfigDefinition): JsonResponse
    {
        $validated = $request->validate([
            'game_type' => 'required|string|max:255|unique:game_config_definitions,game_type,' . $gameConfigDefinition->id,
            'game_name' => 'required|string|max:255',
        ]);
        $gameConfigDefinition->update($validated);
        return response()->json($gameConfigDefinition->load('configFiles'));
    }
    /**
     * Remove the specified game config definition.
     */
    public function destroy(GameConfigDefinition $gameConfigDefinition): JsonResponse
    {
        $gameConfigDefinition->delete();
        return response()->json(['message' => 'Game config definition deleted successfully']);
    }
    /**
     * Store a config file for a game definition.
     */
    public function storeFile(Request $request, GameConfigDefinition $gameConfigDefinition): JsonResponse
    {
        $validated = $request->validate([
            'path' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50|in:properties,yaml,yml,ini,toml,cfg,conf,config,json,xml,txt,text,env,sh,bash,sql',
            'description' => 'nullable|string',
        ]);
        $file = $gameConfigDefinition->configFiles()->create($validated);
        return response()->json($file, 201);
    }
    /**
     * Update a config file.
     */
    public function updateFile(Request $request, GameConfigFile $file): JsonResponse
    {
        $validated = $request->validate([
            'path' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50|in:properties,yaml,yml,ini,toml,cfg,conf,config,json,xml,txt,text,env,sh,bash,sql',
            'description' => 'nullable|string',
        ]);
        $file->update($validated);
        return response()->json($file);
    }
    /**
     * Delete a config file.
     */
    public function destroyFile(GameConfigFile $file): JsonResponse
    {
        $file->delete();
        return response()->json(['message' => 'Config file deleted successfully']);
    }
}
