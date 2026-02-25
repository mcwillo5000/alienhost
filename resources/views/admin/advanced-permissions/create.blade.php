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

            {{-- Left: Role Details --}}
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

            {{-- Right: Permission Sections --}}
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
            </div>

        </div>
    </form>
@endsection
