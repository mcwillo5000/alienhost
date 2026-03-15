@extends('layouts.admin')

@section('title')
    Create Role
@endsection

@section('content-header')
    <h1>Create Role<small>Define a new admin permission role.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advanced-permissions') }}">Advanced Permissions</a></li>
        <li class="active">Create Role</li>
    </ol>
@endsection

@section('content')
    <form action="{{ route('admin.advanced-permissions.store') }}" method="POST">
        {!! csrf_field() !!}

        <div class="row">


            <div class="col-md-5">
                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">Role Details</h3>
                    </div>
                    <div class="box-body">

                        <div class="form-group">
                            <label for="name" class="control-label">
                                Name <span class="field-required"></span>
                            </label>
                            <input type="text"
                                   id="name"
                                   name="name"
                                   class="form-control"
                                   value="{{ old('name') }}"
                                   placeholder="e.g. Support Staff"
                                   required
                                   autofocus />
                        </div>

                        <div class="form-group">
                            <label for="description" class="control-label">
                                Description <span class="field-optional"></span>
                            </label>
                            <textarea id="description"
                                      name="description"
                                      class="form-control"
                                      rows="3"
                                      placeholder="Optional description of what this role can do.">{{ old('description') }}</textarea>
                        </div>

                    </div>
                    <div class="box-footer">
                        <a href="{{ route('admin.advanced-permissions') }}" class="btn btn-default btn-sm">
                            Cancel
                        </a>
                        <button type="submit" class="btn btn-success btn-sm pull-right">
                            <i class="fa fa-save"></i> Create Role
                        </button>
                    </div>
                </div>
            </div>


            <div class="col-md-7">
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">Admin Area Access</h3>
                        <small class="text-muted" style="margin-left:8px">
                            Select which sections of the admin panel this role can access.
                            Overview is always accessible.
                        </small>
                    </div>
                    <div class="box-body">
                        @foreach ($sections as $groupName => $routes)
                            <h5 class="text-uppercase" style="color:#aaa;font-size:11px;letter-spacing:1px;margin-top:12px;margin-bottom:6px">
                                {{ $groupName }}
                            </h5>
                            <div class="row">
                                @foreach ($routes as $prefix => $label)
                                    @php $inputId = 'perm_' . str_replace(['.', '-'], '_', $prefix); @endphp
                                    <div class="col-sm-6">
                                        <div class="checkbox checkbox-primary" style="margin:4px 0">
                                            <input type="checkbox" id="{{ $inputId }}" name="admin_routes[]" value="{{ $prefix }}" {{ in_array($prefix, old('admin_routes', [])) ? 'checked' : '' }}>
                                            <label for="{{ $inputId }}">{{ $label }}</label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <hr style="margin:8px 0">
                        @endforeach
                    </div>
                </div>


                <div class="box box-success" id="user-area-access-box" style="display:none">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-th-list"></i> User Area Access</h3>
                        <small class="text-muted" style="margin-left:8px">
                            Control which server pages role users can see. Leave <strong>all unchecked</strong> for full access (no restrictions).
                        </small>
                    </div>
                    <div class="box-body">
                        @foreach ($serverSections as $sectionName => $pages)
                            <h5 class="text-uppercase" style="color:#aaa;font-size:11px;letter-spacing:1px;margin-top:12px;margin-bottom:6px">
                                {{ $sectionName }}
                            </h5>
                            <div class="row">
                                @foreach ($pages as $pageKey => $pageData)
                                    @php $cbId = 'sp_' . str_replace(['.', '-'], '_', $pageKey); @endphp
                                    <div class="col-sm-6" style="margin-bottom:6px">
                                        <div class="checkbox checkbox-success" style="margin:2px 0">
                                            <input type="checkbox"
                                                   id="{{ $cbId }}"
                                                   name="server_permissions[]"
                                                   value="{{ $pageKey }}"
                                                   {{ in_array($pageKey, old('server_permissions', [])) ? 'checked' : '' }}>
                                            <label for="{{ $cbId }}">
                                                <strong>{{ $pageData['label'] }}</strong>
                                                @if (!empty($pageData['description']))
                                                    <br><small class="text-muted">{{ $pageData['description'] }}</small>
                                                @endif
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <hr style="margin:8px 0">
                        @endforeach
                        <p class="help-block" style="margin-top:8px;margin-bottom:0">
                            <i class="fa fa-info-circle"></i>
                            Unchecking all boxes grants access to <strong>all</strong> pages.
                            Check at least one box to restrict which pages are visible.
                        </p>
                    </div>
                </div>


                <div class="box box-info" id="action-permissions-box" style="display:none">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-key"></i> Action Permissions</h3>
                        <small class="text-muted" style="margin-left:8px">
                            Fine-tune which specific actions this role can perform on servers. Leave <strong>all unchecked</strong> for full action access.
                        </small>
                    </div>
                    <div class="box-body">
                        @foreach ($actionPermissions as $categoryName => $perms)
                            @php $catSlug = \Illuminate\Support\Str::slug($categoryName); @endphp
                            <h5 class="text-uppercase" style="color:#aaa;font-size:11px;letter-spacing:1px;margin-top:12px;margin-bottom:6px">
                                {{ $categoryName }}
                                <a href="#" class="toggle-all-actions" data-category="{{ $catSlug }}"
                                   style="float:right;font-size:10px;text-transform:none;letter-spacing:0;color:#3c8dbc">
                                    Toggle All
                                </a>
                            </h5>
                            <div class="row">
                                @foreach ($perms as $permKey => $permData)
                                    @php $cbId = 'ap_' . str_replace(['.', '-'], '_', $permKey); @endphp
                                    <div class="col-sm-6" style="margin-bottom:6px">
                                        <div class="checkbox checkbox-info" style="margin:2px 0">
                                            <input type="checkbox"
                                                   id="{{ $cbId }}"
                                                   name="server_sub_permissions[]"
                                                   value="{{ $permKey }}"
                                                   data-category="{{ $catSlug }}"
                                                   {{ in_array($permKey, old('server_sub_permissions', [])) ? 'checked' : '' }}>
                                            <label for="{{ $cbId }}">
                                                <strong>{{ $permData['label'] }}</strong>
                                                @if (!empty($permData['description']))
                                                    <br><small class="text-muted">{{ $permData['description'] }}</small>
                                                @endif
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <hr style="margin:8px 0">
                        @endforeach
                        <p class="help-block" style="margin-top:8px;margin-bottom:0">
                            <i class="fa fa-info-circle"></i>
                            Pages above control <strong>visibility only</strong>. Actions must be explicitly granted here.
                            If no action permissions are checked, the role can see the page but cannot perform any actions.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </form>

@section('footer-scripts')
    @parent
    <script>
    (function () {
        var $serverAccessCb     = $('#perm_special_server_access');
        var $userAreaBox        = $('#user-area-access-box');
        var $actionPermsBox     = $('#action-permissions-box');
        var pageToActions       = @json($pageToActions);

        function syncBoxes() {
            if ($serverAccessCb.is(':checked')) {
                $userAreaBox.slideDown(150);
                $actionPermsBox.slideDown(150);
            } else {
                $userAreaBox.slideUp(150);
                $actionPermsBox.slideUp(150);
            }
        }

        $serverAccessCb.on('change', syncBoxes);
        syncBoxes();

        // Auto-check related action permissions when a page is checked
        $('[name="server_permissions[]"]').on('change', function () {
            if ($(this).is(':checked')) {
                var pageKey = $(this).val();
                var actions = pageToActions[pageKey] || [];
                actions.forEach(function (action) {
                    $('[name="server_sub_permissions[]"][value="' + action + '"]').prop('checked', true);
                });
            }
        });

        // Toggle all per category
        $('.toggle-all-actions').on('click', function (e) {
            e.preventDefault();
            var cat = $(this).data('category');
            var $checkboxes = $('[name="server_sub_permissions[]"][data-category="' + cat + '"]');
            var allChecked = $checkboxes.filter(':checked').length === $checkboxes.length;
            $checkboxes.prop('checked', !allChecked);
        });
    })();
    </script>
@endsection
@endsection
