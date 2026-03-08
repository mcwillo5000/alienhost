<?php

namespace Pterodactyl\Http\Controllers\Admin\Extensions\databaseimportexport;

use Illuminate\View\View;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;
use Pterodactyl\BlueprintFramework\Libraries\ExtensionLibrary\Admin\BlueprintAdminLibrary;

class databaseimportexportExtensionController extends Controller
{
    public function __construct(
        private ViewFactory $view,
        private BlueprintAdminLibrary $blueprint,
    ) {}

    public function index(): View
    {
        return $this->view->make(
            'admin.extensions.databaseimportexport.index', [
                'root' => '/admin/extensions/databaseimportexport',
                'blueprint' => $this->blueprint,
            ]
        );
    }

    public function post(databaseimportexportSettingsFormRequest $request): View
    {
        $this->blueprint->notify('Applied new settings');

        foreach ($request->validated() as $key => $value) {
            $this->blueprint->dbSet('databaseimportexport', $key, $value);
        }

        return $this->view->make(
            'admin.extensions.databaseimportexport.index', [
                'root' => '/admin/extensions/databaseimportexport',
                'blueprint' => $this->blueprint,
            ]
        );
    }
}

class databaseimportexportSettingsFormRequest extends AdminFormRequest
    {
        public function rules(): array
        {
            return [
                'max_import_size' => 'required|integer|min:1',
                'max_export_size' => 'required|integer|min:1',
                'allow_remote_import' => 'required|string|in:1,0',
            ];
        }
}